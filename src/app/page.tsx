"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { AnimeCard } from "@/components/AnimeCard";
import { Anime } from "@/lib/types/anime";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Clock, Star, ChevronRight, Sparkles, Pin, Film, Tv, Calendar, Play, Eye, MoreVertical, Filter, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { SocialLinksDialog } from "@/components/SocialLinksDialog";
import { ContinueWatching } from "@/components/ContinueWatching";

const genres = [
  { name: "Action", color: "from-red-500 to-orange-500" },
  { name: "Adventure", color: "from-green-500 to-emerald-500" },
  { name: "Comedy", color: "from-yellow-500 to-amber-500" },
  { name: "Drama", color: "from-purple-500 to-violet-500" },
  { name: "Fantasy", color: "from-blue-500 to-cyan-500" },
  { name: "Horror", color: "from-gray-700 to-gray-900" },
  { name: "Romance", color: "from-pink-500 to-rose-500" },
  { name: "Sci-Fi", color: "from-indigo-500 to-blue-500" },
  { name: "Slice of Life", color: "from-teal-500 to-green-500" },
  { name: "Sports", color: "from-orange-500 to-red-500" },
  { name: "Mystery", color: "from-slate-600 to-slate-800" },
  { name: "Thriller", color: "from-zinc-600 to-zinc-800" },
  { name: "Supernatural", color: "from-violet-600 to-purple-800" },
  { name: "Mecha", color: "from-cyan-500 to-blue-600" },
  { name: "Music", color: "from-fuchsia-500 to-pink-600" },
];

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

// Time slots for schedule
const timeSlots = ["10:00", "12:30", "15:00", "17:30", "19:00", "21:00", "23:30"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ScheduledEpisode {
  id: number;
  animeId: number;
  episodeNumber: number;
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "upcoming" | "airing" | "aired" | "delayed";
  notifyUsers: boolean;
  streamUrl: string | null;
  notes: string | null;
}

export default function Home() {
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduledEpisodes, setScheduledEpisodes] = useState<ScheduledEpisode[]>([]);
  const [showSocialDialog, setShowSocialDialog] = useState(false);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const [animeRes, scheduledRes] = await Promise.all([
          fetch("/api/anime"),
          fetch("/api/scheduled-episodes"),
        ]);
        const animeData = await animeRes.json();
        const scheduledData = await scheduledRes.json();
        
        setAllAnime(animeData);
        setScheduledEpisodes(Array.isArray(scheduledData) ? scheduledData : []);
      } catch (error) {
        console.error("Error fetching anime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, []);

  // Show social dialog after 2 seconds on first load
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      const hasSeenDialog = localStorage.getItem("hasSeenSocialDialog");
      if (!hasSeenDialog) {
        const timer = setTimeout(() => {
          setShowSocialDialog(true);
          try {
            localStorage.setItem("hasSeenSocialDialog", "true");
          } catch (e) {
            console.warn("localStorage access denied");
          }
        }, 2000);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn("localStorage access denied");
    }
  }, []);

  // Featured - for carousel (top trending anime since featured field is removed)
  const featuredAnime = allAnime.filter(a => a.trending).slice(0, 5);
  
  // Trending Now - based on trending flag
  const trendingNow = allAnime.filter(a => a.trending).slice(0, 12);
  
  // Most Watched - based on mostWatched flag
  const mostWatched = allAnime.filter(a => a.mostWatched).slice(0, 12);
  
  // Pinned - anime that are pinned
  const pinnedAnime = allAnime.filter(a => a.pinned).slice(0, 12);
  
  // New Series - ongoing anime sorted by year
  const newSeries = allAnime.filter(a => a.status === 'ongoing').sort((a, b) => b.releaseYear - a.releaseYear).slice(0, 12);
  
  // New Movies - movies (type === 'Movie')
  const newMovies = allAnime.filter(a => a.type === 'Movie').slice(0, 12);
  
  // Recently Added - most recent by year
  const recentlyAdded = [...allAnime].sort((a, b) => b.releaseYear - a.releaseYear).slice(0, 12);
  
  // Schedule - ongoing anime with date/time info
  const scheduleAnime = allAnime.filter(a => a.status === 'ongoing').slice(0, 12);
  
  // Generate schedule with real data from API
  const getScheduleWithTimes = () => {
    return scheduledEpisodes
      .filter(s => s.status === "upcoming" || s.status === "airing")
      .slice(0, 12)
      .map((schedule) => {
        const anime = allAnime.find(a => parseInt(a.id) === schedule.animeId);
        if (!anime) return null;
        
        const scheduleDate = new Date(schedule.scheduledDate);
        const dayName = days[scheduleDate.getDay()];
        
        return {
          anime,
          date: scheduleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          day: dayName,
          time: schedule.scheduledTime,
          episodeNumber: schedule.episodeNumber,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (!a || !b) return 0;
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.time.localeCompare(b.time);
      });
  };

  const scheduleWithTimes = getScheduleWithTimes();

  const Section = ({ 
    title, 
    icon: Icon, 
    iconColor, 
    anime, 
    href 
  }: { 
    title: string; 
    icon: React.ElementType; 
    iconColor: string; 
    anime: Anime[]; 
    href: string;
  }) => (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${iconColor}`}>
            <Icon className="h-3.5 w-3.5 text-white" />
          </div>
          <h2 className="text-sm md:text-base font-bold text-foreground">
            {title}
          </h2>
        </div>
        <Link href={href}>
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-primary rounded-lg group h-7 px-2">
            View All
            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {anime.length > 0 ? anime.map((a, index) => (
          <AnimeCard key={a.id} anime={a} rank={title === "Trending Now" ? index + 1 : undefined} showRank={title === "Trending Now"} />
        )) : (
          <p className="text-muted-foreground text-sm py-4">No anime available</p>
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Social Links Dialog */}
      <SocialLinksDialog open={showSocialDialog} onOpenChange={setShowSocialDialog} />
      
      {loading ? (
        <div className="space-y-8">
          <Skeleton className="w-full h-[200px]" />
          <div className="container mx-auto px-4">
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="flex gap-2.5 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-24 md:w-28 space-y-2">
                  <Skeleton className="aspect-[2/3] rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <FeaturedCarousel anime={featuredAnime} />

          <div className="container mx-auto px-4 py-6 space-y-8">
            {/* Continue Watching */}
            <ContinueWatching />

            {/* Trending Now */}
            <Section 
              title="Trending Now" 
              icon={Flame} 
              iconColor="from-orange-500 to-red-500" 
              anime={trendingNow} 
              href="/trending" 
            />

            {/* Most Watched */}
            {mostWatched.length > 0 && (
              <Section 
                title="Most Watched" 
                icon={Eye} 
                iconColor="from-cyan-500 to-blue-500" 
                anime={mostWatched} 
                href="/browse?mostWatched=true" 
              />
            )}

            {/* Pinned */}
            {pinnedAnime.length > 0 && (
              <Section 
                title="Pinned" 
                icon={Pin} 
                iconColor="from-purple-500 to-pink-500" 
                anime={pinnedAnime} 
                href="/browse?pinned=true" 
              />
            )}

            {/* New Series */}
            <Section 
              title="New Series" 
              icon={Tv} 
              iconColor="from-green-500 to-emerald-500" 
              anime={newSeries} 
              href="/browse?status=ongoing" 
            />

            {/* New Movies */}
            {newMovies.length > 0 && (
              <Section 
                title="New Movies" 
                icon={Film} 
                iconColor="from-purple-500 to-violet-500" 
                anime={newMovies} 
                href="/browse?type=movie" 
              />
            )}

            {/* Recently Added */}
            <Section 
              title="Recently Added" 
              icon={Clock} 
              iconColor="from-pink-500 to-rose-500" 
              anime={recentlyAdded} 
              href="/browse?sort=year" 
            />

            {/* Schedule with Date/Time */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500">
                    <Calendar className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h2 className="text-sm md:text-base font-bold text-foreground">
                    Schedule
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1.5 h-7 px-2 text-xs text-muted-foreground hover:text-primary rounded-lg">
                        <SlidersHorizontal className="h-3 w-3" />
                        <span className="hidden sm:inline">Options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel className="text-xs">View Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/schedule?view=today" className="cursor-pointer">
                          <Clock className="h-3.5 w-3.5 mr-2" />
                          Today Only
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/schedule?view=week" className="cursor-pointer">
                          <Calendar className="h-3.5 w-3.5 mr-2" />
                          This Week
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/schedule?view=timeline" className="cursor-pointer">
                          <Tv className="h-3.5 w-3.5 mr-2" />
                          Timeline View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs">Filter By</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/schedule?filter=new" className="cursor-pointer">
                          <Sparkles className="h-3.5 w-3.5 mr-2" />
                          New Episodes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/schedule?status=airing" className="cursor-pointer">
                          <Play className="h-3.5 w-3.5 mr-2" />
                          Currently Airing
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link href="/schedule">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-primary rounded-lg group h-7 px-2">
                      View All
                      <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Mobile: Horizontal Scroll | Desktop: Grid Layout */}
              <div className="flex md:grid md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {scheduleWithTimes.length > 0 ? scheduleWithTimes.filter(item => item !== null).map((item) => (
                  <Link
                    key={item!.anime.id}
                    href={`/anime/${item!.anime.slug}`}
                    className="flex-shrink-0 md:flex-shrink w-28 md:w-auto group"
                  >
                    <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-1.5">
                      <img 
                        src={item!.anime.coverImage || ""} 
                        alt={item!.anime.title}
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-primary/90 backdrop-blur-sm rounded-md">
                        <span className="text-[10px] font-medium text-white">EP {item!.episodeNumber}</span>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-1.5 space-y-0.5">
                        <div className="flex items-center gap-1 text-white">
                          <Calendar className="h-2.5 w-2.5" />
                          <span className="text-[9px] font-medium">{item!.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-white">
                          <Clock className="h-2.5 w-2.5" />
                          <span className="text-[9px] font-medium">{item!.time} JST</span>
                        </div>
                        <div className="text-[8px] text-white/70">{item!.day}</div>
                      </div>
                    </div>
                    <h3 className="text-[10px] font-medium text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                      {item!.anime.title}
                    </h3>
                  </Link>
                )) : (
                  <p className="text-muted-foreground text-sm py-4">No scheduled anime</p>
                )}
              </div>
            </section>

            {/* Genres Section - Grid Layout */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg gradient-primary">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <h2 className="text-sm md:text-base font-bold text-foreground">
                  Genres
                </h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {genres.map((genre) => (
                  <Link
                    key={genre.name}
                    href={`/browse?genre=${genre.name.toLowerCase()}`}
                    className={`px-4 py-3 rounded-xl bg-gradient-to-r ${genre.color} text-white text-xs md:text-sm font-medium hover:scale-105 transition-transform shadow-lg text-center`}
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            </section>

            {/* A-Z Index Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800">
                  <span className="text-[10px] font-bold text-white">AZ</span>
                </div>
                <h2 className="text-sm md:text-base font-bold text-foreground">
                  Browse A-Z
                </h2>
              </div>
              <div className="glass rounded-2xl p-4 border border-border">
                <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-14 lg:grid-cols-27 gap-1.5">
                  {alphabet.map((letter) => (
                    <Link
                      key={letter}
                      href={`/browse?letter=${letter === "#" ? "other" : letter.toLowerCase()}`}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-card hover:bg-primary hover:text-primary-foreground text-sm font-semibold text-muted-foreground transition-all border border-border hover:border-primary hover:scale-110"
                    >
                      {letter}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}