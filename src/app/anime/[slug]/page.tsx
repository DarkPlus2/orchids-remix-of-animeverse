"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { EpisodesList } from "@/components/EpisodesList";
import { CommentSection } from "@/components/comments/CommentSection";
import { Anime, Episode } from "@/lib/types/anime";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Play, Calendar, Tv, Clock, Heart, Share2, ChevronRight, Bookmark, Info, Film, Layers, Building2, User2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimeCard } from "@/components/AnimeCard";

export default function AnimeDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"episodes" | "details" | "comments">("episodes");
  const [relatedAnime, setRelatedAnime] = useState<Anime[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const res = await fetch(`/api/anime/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setAnime(data);
        }
      } catch (error) {
        console.error("Error fetching anime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [slug]);

  // Fetch related anime based on genres
  useEffect(() => {
    const fetchRelatedAnime = async () => {
      if (!anime) return;
      
      try {
        const res = await fetch("/api/anime");
        if (res.ok) {
          const allAnime = await res.json();
          
          // Filter out current anime and find similar ones
          const similar = allAnime
            .filter((a: Anime) => a.slug !== anime.slug)
            .map((a: Anime) => {
              // Calculate similarity score based on shared genres
              const sharedGenres = a.genres.filter(g => anime.genres.includes(g)).length;
              const ratingDiff = Math.abs(a.rating - anime.rating);
              const score = sharedGenres * 10 - ratingDiff;
              return { ...a, similarityScore: score };
            })
            .sort((a: any, b: any) => b.similarityScore - a.similarityScore)
            .slice(0, 12);
          
          setRelatedAnime(similar);
        }
      } catch (error) {
        console.error("Error fetching related anime:", error);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedAnime();
  }, [anime]);

  // Group episodes by season
  const episodesBySeason = anime?.episodes.reduce((acc, episode) => {
    const season = episode.season || 1;
    if (!acc[season]) {
      acc[season] = [];
    }
    acc[season].push(episode);
    return acc;
  }, {} as Record<number, Episode[]>) || {};

  const seasons = Object.keys(episodesBySeason).map(Number).sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16">
          <Skeleton className="w-full h-[400px] md:h-[500px] lg:h-[600px]" />
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-40 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Tv className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Anime Not Found</h1>
            <p className="text-muted-foreground mb-8">The anime you're looking for doesn't exist or has been removed.</p>
            <Link href="/">
              <Button className="gap-2">
                <ChevronRight className="h-4 w-4 rotate-180" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Transform episodes for EpisodesList component
  const episodesForList = anime.episodes.map(ep => ({
    id: ep.id || ep.number,
    animeId: parseInt(anime.id),
    episodeNumber: ep.number,
    title: ep.title,
    thumbnail: ep.thumbnail,
    season: ep.season || 1,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Banner Background - Improved Responsive Heights */}
      <div className="relative h-[350px] sm:h-[450px] md:h-[500px] lg:h-[550px] xl:h-[600px] overflow-hidden">
        {/* Banner Image */}
        <div className="absolute inset-0">
          <Image
            src={anime.bannerImage}
            alt={anime.title}
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay gradient - stronger at bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-background" />
        </div>

        {/* Content - Positioned Lower with Better Responsive Sizing */}
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 h-full flex items-end pb-6 sm:pb-8 md:pb-10 lg:pb-12 xl:pb-14">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 w-full">
            {/* Cover Image - Improved Responsive Sizing */}
            <div className="w-28 sm:w-36 md:w-44 lg:w-52 xl:w-60 2xl:w-64 flex-shrink-0 mx-auto sm:mx-0">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-2xl ring-2 ring-primary/20">
                <Image
                  src={anime.coverImage}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Title and Basic Info - Improved Typography Scaling */}
            <div className="flex-1 space-y-2 sm:space-y-2.5 md:space-y-3 lg:space-y-3.5 xl:space-y-4 pb-2 text-center sm:text-left">
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <Badge className="bg-primary/90 backdrop-blur-sm text-white border-0 px-2 py-1 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5 text-xs sm:text-xs md:text-sm">
                  {anime.type}
                </Badge>
                {anime.status === "ongoing" && (
                  <Badge className="bg-green-500/90 backdrop-blur-sm text-white border-0 px-2 py-1 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5 text-xs sm:text-xs md:text-sm">
                    • Airing
                  </Badge>
                )}
                <Badge variant="outline" className="backdrop-blur-sm border-white/30 text-white px-2 py-1 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5 text-xs sm:text-xs md:text-sm">
                  {anime.releaseYear}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black text-white leading-tight drop-shadow-2xl">
                {anime.title}
              </h1>
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap justify-center sm:justify-start">
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400">{anime.rating}</span>
                  <span className="text-white/70 text-sm sm:text-base md:text-lg">/10</span>
                </div>
                <div className="h-4 sm:h-5 md:h-6 w-px bg-white/20" />
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-white/90">
                  <Tv className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                  <span className="font-medium text-sm sm:text-base md:text-lg">{anime.totalEpisodes} Episodes</span>
                </div>
                {seasons.length > 1 && (
                  <>
                    <div className="h-4 sm:h-5 md:h-6 w-px bg-white/20" />
                    <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-white/90">
                      <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                      <span className="font-medium text-sm sm:text-base md:text-lg">{seasons.length} Seasons</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Improved Container Sizing */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 -mt-6 sm:-mt-8 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
          {/* Action Buttons - Improved Responsive Layout */}
          <div className="glass-strong rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-xl">
            <div className="space-y-2.5 sm:space-y-3">
              {anime.episodes.length > 0 && (
                <Link href={`/anime/${anime.slug}/watch/1`} className="block">
                  <Button size="lg" className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg shadow-primary/25 text-sm sm:text-base md:text-lg h-11 sm:h-12 md:h-13 lg:h-14">
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 fill-current" />
                    Watch Now
                  </Button>
                </Link>
              )}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-3">
                <Button variant="outline" className="gap-1 sm:gap-1.5 md:gap-2 border-border/50 hover:border-primary h-9 sm:h-10 md:h-11 text-xs sm:text-sm">
                  <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Favorite</span>
                </Button>
                <Button variant="outline" className="gap-1 sm:gap-1.5 md:gap-2 border-border/50 hover:border-primary h-9 sm:h-10 md:h-11 text-xs sm:text-sm">
                  <Bookmark className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Watchlist</span>
                </Button>
                <Button variant="outline" className="gap-1 sm:gap-1.5 md:gap-2 border-border/50 hover:border-primary h-9 sm:h-10 md:h-11 text-xs sm:text-sm">
                  <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Genres - Improved Spacing */}
          <div className="glass rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6">
            <h3 className="text-xs sm:text-sm md:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 sm:mb-3">Genres</h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {anime.genres.map((genre) => (
                <Link key={genre} href={`/browse?genre=${genre.toLowerCase()}`}>
                  <Badge 
                    variant="outline" 
                    className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm hover:bg-primary hover:text-white hover:border-primary cursor-pointer transition-all"
                  >
                    {genre}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Synopsis - Improved Typography */}
          <div className="glass rounded-2xl p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground mb-3 sm:mb-4 md:mb-5 lg:mb-6 flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 md:h-7 lg:h-8 bg-gradient-to-b from-primary to-purple-600 rounded-full" />
              Synopsis
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base md:text-base lg:text-lg whitespace-pre-line">
              {anime.synopsis}
            </p>
          </div>

          {/* Tabs Section - Improved Responsive Design */}
          <div className="glass rounded-2xl overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-border/50">
              <button
                onClick={() => setActiveTab("episodes")}
                className={`flex-1 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 font-semibold transition-all relative text-xs sm:text-sm md:text-base ${
                  activeTab === "episodes" 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <Play className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  Episodes ({anime.episodes.length})
                </span>
                {activeTab === "episodes" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`flex-1 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 font-semibold transition-all relative text-xs sm:text-sm md:text-base ${
                  activeTab === "details" 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  Details
                </span>
                {activeTab === "details" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`flex-1 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 font-semibold transition-all relative text-xs sm:text-sm md:text-base ${
                  activeTab === "comments" 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  Comments
                </span>
                {activeTab === "comments" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600" />
                )}
              </button>
            </div>

            {/* Tab Content - Improved Padding */}
            <div className="p-3 sm:p-4 md:p-5 lg:p-6">
              {/* Episodes List */}
              {activeTab === "episodes" && (
                <EpisodesList 
                  episodes={episodesForList}
                  animeSlug={anime.slug}
                />
              )}

              {/* Details Tab */}
              {activeTab === "details" && (
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Additional Information */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-foreground text-base md:text-lg">Additional Information</h3>
                        <div className="space-y-3 text-xs md:text-sm">
                          <div className="flex justify-between items-start py-2">
                            <span className="text-muted-foreground font-medium">Format</span>
                            <span className="text-foreground text-right font-semibold">{anime.type}</span>
                          </div>
                          <div className="h-px bg-border/50" />
                          <div className="flex justify-between items-start py-2">
                            <span className="text-muted-foreground font-medium">Episode Duration</span>
                            <span className="text-foreground text-right font-semibold">{anime.duration || 24} mins</span>
                          </div>
                          <div className="h-px bg-border/50" />
                          <div className="flex justify-between items-start py-2">
                            <span className="text-muted-foreground font-medium">Total Episodes</span>
                            <span className="text-foreground text-right font-semibold">{anime.totalEpisodes}</span>
                          </div>
                          <div className="h-px bg-border/50" />
                          {seasons.length > 1 && (
                            <>
                              <div className="flex justify-between items-start py-2">
                                <span className="text-muted-foreground font-medium">Total Seasons</span>
                                <span className="text-foreground text-right font-semibold">{seasons.length}</span>
                              </div>
                              <div className="h-px bg-border/50" />
                            </>
                          )}
                          <div className="flex justify-between items-start py-2">
                            <span className="text-muted-foreground font-medium">Status</span>
                            <Badge variant={anime.status === "ongoing" ? "default" : "secondary"} className="text-xs">
                              {anime.status === "ongoing" ? "Currently Airing" : "Finished Airing"}
                            </Badge>
                          </div>
                          <div className="h-px bg-border/50" />
                          <div className="flex justify-between items-start py-2">
                            <span className="text-muted-foreground font-medium">Release Year</span>
                            <span className="text-foreground text-right font-semibold">{anime.releaseYear}</span>
                          </div>
                          <div className="h-px bg-border/50" />
                          <div className="flex justify-between items-start py-2">
                            <span className="text-muted-foreground font-medium">Average Score</span>
                            <div className="flex items-center gap-2">
                              <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-foreground font-bold">{anime.rating}/10</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Production Information */}
                      <div className="space-y-6">
                        {/* Studios */}
                        <div className="space-y-3">
                          <h3 className="font-bold text-foreground text-base md:text-lg flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" />
                            Studios
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {anime.studios && anime.studios.length > 0 ? (
                              anime.studios.map((studio) => (
                                <Badge key={studio} variant="secondary" className="px-3 py-1 text-xs">
                                  {studio}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs italic">No studio information</span>
                            )}
                          </div>
                        </div>

                        {/* Producers */}
                        <div className="space-y-3">
                          <h3 className="font-bold text-foreground text-base md:text-lg flex items-center gap-2">
                            <User2 className="h-4 w-4 text-primary" />
                            Producers
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {anime.producers && anime.producers.length > 0 ? (
                              anime.producers.map((producer) => (
                                <Badge key={producer} variant="outline" className="px-3 py-1 text-xs border-border/50">
                                  {producer}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs italic">No producer information</span>
                            )}
                          </div>
                        </div>

                        {/* Genres Extended */}
                        <div className="space-y-3 pt-2">
                          <h3 className="font-bold text-foreground text-base md:text-lg">Genres & Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {anime.genres.map((genre) => (
                              <Link key={genre} href={`/browse?genre=${genre.toLowerCase()}`}>
                                <Badge 
                                  variant="outline" 
                                  className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm hover:bg-primary hover:text-white hover:border-primary cursor-pointer transition-all hover:scale-105"
                                >
                                  {genre}
                                </Badge>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                  </div>
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === "comments" && (
                <CommentSection animeId={anime.id} />
              )}
            </div>
          </div>

          {/* You Might Also Like Section */}
          {relatedAnime.length > 0 && (
            <div className="glass rounded-2xl p-5 md:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-5 md:mb-6">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2">
                  <div className="w-1 h-6 md:h-8 bg-gradient-to-b from-primary to-purple-600 rounded-full" />
                  You Might Also Like
                </h2>
                <Link href="/browse">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-primary rounded-lg group">
                    View All
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
              
              {loadingRelated ? (
                <div className="flex gap-2.5 overflow-x-auto pb-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-24 md:w-28 space-y-2">
                      <Skeleton className="aspect-[2/3] rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {relatedAnime.map((relatedItem) => (
                    <AnimeCard key={relatedItem.id} anime={relatedItem} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}