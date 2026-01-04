"use client";

import { useEffect, useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { AnimeCard } from "@/components/AnimeCard";
import { Anime } from "@/lib/types/anime";
import { TrendingUp, Flame, Clock, Calendar, Trophy, Crown, Medal, Award, Star, ChevronUp, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const timeFilters = [
  { value: "today", label: "Today", icon: Clock },
  { value: "week", label: "This Week", icon: Calendar },
  { value: "month", label: "This Month", icon: Calendar },
  { value: "all", label: "All Time", icon: Trophy },
];

const categories = [
  { value: "all", label: "All Anime" },
  { value: "action", label: "Action" },
  { value: "romance", label: "Romance" },
  { value: "comedy", label: "Comedy" },
  { value: "fantasy", label: "Fantasy" },
];

export default function TrendingPage() {
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("week");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Fetch trending anime from API
        const res = await fetch("/api/anime?trending=true");
        const trendingData = await res.json();
        setTrendingAnime(trendingData);
        
        // Fetch all anime for rising stars
        const allRes = await fetch("/api/anime");
        const allData = await allRes.json();
        setAllAnime(allData);
      } catch (error) {
        console.error("Error fetching trending anime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  // Filter by category
  const filteredAnime = useMemo(() => {
    let result = [...trendingAnime];
    if (category !== "all") {
      result = result.filter(a => 
        a.genres.some(g => g.toLowerCase() === category.toLowerCase())
      );
    }
    return result;
  }, [trendingAnime, category]);

  // Top 10 for rankings
  const top10 = filteredAnime.slice(0, 10);
  
  // Rising stars (high rated but not in trending)
  const risingStars = allAnime
    .filter(a => !a.trending)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "from-yellow-500/20 to-amber-500/10 border-yellow-500/30";
    if (rank === 2) return "from-gray-400/20 to-gray-500/10 border-gray-400/30";
    if (rank === 3) return "from-amber-600/20 to-orange-500/10 border-amber-600/30";
    return "from-transparent to-transparent border-border";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 glow-accent">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Trending Anime
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Most popular anime right now
              </p>
            </div>
          </div>
          
          {/* Time Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {timeFilters.map(filter => (
              <Button
                key={filter.value}
                variant={timeFilter === filter.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeFilter(filter.value)}
                className={`gap-2 rounded-xl flex-shrink-0 ${timeFilter === filter.value ? "gradient-primary" : ""}`}
              >
                <filter.icon className="h-4 w-4" />
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
                category === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-card/80 text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Top 10 Rankings */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-bold">Top 10 Rankings</h2>
              </div>
              
              {top10.length > 0 ? (
                <div className="space-y-3">
                  {top10.map((anime, index) => {
                    const rank = index + 1;
                    const isTop3 = rank <= 3;
                    
                    return (
                      <Link 
                        key={anime.id} 
                        href={`/anime/${anime.slug}`}
                        className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${getRankBg(rank)} border hover:scale-[1.01] transition-all group`}
                      >
                        {/* Rank */}
                        <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${
                          isTop3 ? "glass" : "bg-card"
                        }`}>
                          {getRankIcon(rank)}
                        </div>
                        
                        {/* Cover */}
                        <img 
                          src={anime.coverImage} 
                          alt={anime.title}
                          className="w-14 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {anime.title}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">{anime.japaneseTitle}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              {anime.rating}
                            </span>
                            <span className="text-xs text-muted-foreground">{anime.releaseYear}</span>
                            <div className="flex gap-1">
                              {anime.genres.slice(0, 2).map(g => (
                                <span key={g} className="px-2 py-0.5 bg-background/50 rounded text-xs text-muted-foreground">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Trend indicator */}
                        <div className="hidden md:flex items-center gap-1 text-green-500">
                          <ChevronUp className="h-4 w-4" />
                          <span className="text-xs font-medium">+{Math.floor(Math.random() * 50) + 10}%</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 glass rounded-2xl">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No trending anime in this category</p>
                </div>
              )}
            </section>

            {/* Hot Right Now - Grid */}
            {filteredAnime.length > 10 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <h2 className="text-lg font-bold">Hot Right Now</h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {filteredAnime.slice(10).map((anime, i) => (
                    <AnimeCard key={anime.id} anime={anime} rank={i + 11} showRank />
                  ))}
                </div>
              </section>
            )}

            {/* Rising Stars */}
            {risingStars.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-purple-500" />
                  <h2 className="text-lg font-bold">Rising Stars</h2>
                  <span className="text-xs text-muted-foreground">Hidden gems you might like</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {risingStars.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}