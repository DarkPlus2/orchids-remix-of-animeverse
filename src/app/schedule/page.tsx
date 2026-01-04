"use client";

import { useEffect, useState, useMemo } from "react";
import { Navigation } from "@/components/Navigation";
import { Anime } from "@/lib/types/anime";
import { Calendar, Clock, ChevronLeft, ChevronRight, Bell, Play, Star, Tv, Filter, SlidersHorizontal, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";

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
  season: number;
  embedSources: { name: string; url: string }[];
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function SchedulePage() {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [scheduledEpisodes, setScheduledEpisodes] = useState<ScheduledEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");
  const [notifiedAnime, setNotifiedAnime] = useState<Set<string>>(new Set());
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"time" | "rating">("time");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [animeRes, scheduledRes] = await Promise.all([
          fetch("/api/anime"),
          fetch("/api/scheduled-episodes"),
        ]);
        const animeData = await animeRes.json();
        const scheduledData = await scheduledRes.json();
        
        setAnime(animeData);
        setScheduledEpisodes(Array.isArray(scheduledData) ? scheduledData : []);
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAnimeName = (animeId: number) => {
    const animeItem = anime.find((a) => parseInt(a.id) === animeId);
    return animeItem?.title || "Unknown";
  };

  const getAnime = (animeId: number) => {
    return anime.find((a) => parseInt(a.id) === animeId);
  };

  // Filter scheduled episodes for selected day
  const getScheduleForDay = (dayIndex: number): ScheduledEpisode[] => {
    return scheduledEpisodes.filter((ep) => {
      const scheduleDate = new Date(ep.scheduledDate);
      return scheduleDate.getDay() === dayIndex;
    });
  };

  const currentDate = new Date();
  const getDateForDay = (dayIndex: number) => {
    const diff = dayIndex - currentDate.getDay();
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + diff);
    return date;
  };

  const schedule = useMemo(() => {
    let scheduleItems = getScheduleForDay(selectedDay);
    
    // Filter by status
    if (statusFilter !== "all") {
      scheduleItems = scheduleItems.filter(item => item.status === statusFilter);
    }
    
    // Sort by time or rating
    if (sortBy === "rating") {
      scheduleItems = scheduleItems.sort((a, b) => {
        const animeA = getAnime(a.animeId);
        const animeB = getAnime(b.animeId);
        return (animeB?.rating || 0) - (animeA?.rating || 0);
      });
    } else {
      scheduleItems = scheduleItems.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    }
    
    return scheduleItems;
  }, [scheduledEpisodes, anime, selectedDay, statusFilter, sortBy]);

  const toggleNotification = (episodeId: number) => {
    setNotifiedAnime(prev => {
      const newSet = new Set(prev);
      const key = episodeId.toString();
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Get upcoming episodes today
  const upcomingToday = useMemo(() => {
    const todaySchedule = getScheduleForDay(currentDate.getDay());
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    return todaySchedule
      .filter(item => item.scheduledTime > currentTimeStr && (item.status === "upcoming" || item.status === "airing"))
      .slice(0, 3);
  }, [scheduledEpisodes, anime]);

  const navigateDay = (direction: number) => {
    setSelectedDay(prev => {
      const newDay = prev + direction;
      if (newDay < 0) return 6;
      if (newDay > 6) return 0;
      return newDay;
    });
  };

  // Get unique time slots from scheduled episodes
  const getTimeSlots = () => {
    const times = new Set(scheduledEpisodes.map(ep => ep.scheduledTime));
    return Array.from(times).sort();
  };

  const timeSlots = getTimeSlots();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 glow-primary">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Anime Schedule
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Weekly airing schedule • {schedule.length} episodes {days[selectedDay]}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Filter & Sort</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs">Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Episodes
                  {statusFilter === "all" && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("upcoming")}>
                  Upcoming
                  {statusFilter === "upcoming" && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("airing")}>
                  Currently Airing
                  {statusFilter === "airing" && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs">Sort By</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSortBy("time")}>
                  <Clock className="h-3.5 w-3.5 mr-2" />
                  Air Time
                  {sortBy === "time" && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("rating")}>
                  <TrendingUp className="h-3.5 w-3.5 mr-2" />
                  Rating
                  {sortBy === "rating" && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-lg"
            >
              List
            </Button>
            <Button
              variant={viewMode === "timeline" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("timeline")}
              className="rounded-lg"
            >
              Timeline
            </Button>
          </div>
        </div>

        {/* Up Next Today */}
        {upcomingToday.length > 0 && selectedDay === currentDate.getDay() && (
          <div className="glass rounded-2xl p-4 mb-6 border border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative">
                <Clock className="h-4 w-4 text-primary" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <span className="text-sm font-medium text-primary">Up Next Today</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {upcomingToday.map(item => {
                const animeItem = getAnime(item.animeId);
                return (
                  <Link
                    key={item.id}
                    href={`/anime/${animeItem?.slug}`}
                    className="flex-shrink-0 flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-background/80 transition-colors"
                  >
                    <img 
                      src={item.thumbnail || animeItem?.coverImage || ""} 
                      alt={getAnimeName(item.animeId)}
                      className="w-12 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-sm text-foreground truncate max-w-[150px]">{getAnimeName(item.animeId)}</p>
                      <p className="text-xs text-muted-foreground">EP {item.episodeNumber}</p>
                      <p className="text-xs text-primary font-medium">{item.scheduledTime} JST</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Day Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDay(-1)}
              className="rounded-full h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {days.map((day, index) => {
                const date = getDateForDay(index);
                const isToday = index === currentDate.getDay();
                const isSelected = index === selectedDay;
                const scheduleCount = getScheduleForDay(index).length;
                
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(index)}
                    className={`flex-shrink-0 px-4 py-3 rounded-xl transition-all min-w-[100px] ${
                      isSelected
                        ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-105"
                        : "bg-card hover:bg-card/80 text-foreground border border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="text-[10px] opacity-70 uppercase tracking-wider">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="font-semibold text-sm mt-0.5">
                      {day.slice(0, 3)}
                      {isToday && <span className="ml-1 text-[10px] opacity-70">(Today)</span>}
                    </div>
                    <div className={`text-[10px] mt-1 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {scheduleCount} show{scheduleCount !== 1 ? "s" : ""}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDay(1)}
              className="rounded-full h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Schedule Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{days[selectedDay]}</h2>
                <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                  {schedule.length} episode{schedule.length !== 1 ? "s" : ""}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {getDateForDay(selectedDay).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            
            {schedule.length > 0 ? (
              viewMode === "list" ? (
                <div className="space-y-3">
                  {schedule.map((item) => {
                    const animeItem = getAnime(item.animeId);
                    return (
                      <div 
                        key={item.id} 
                        className="glass rounded-xl p-4 border border-border hover:border-primary/30 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Time */}
                          <div className="text-center min-w-[60px]">
                            <div className="text-lg font-bold text-primary">{item.scheduledTime}</div>
                            <div className="text-[10px] text-muted-foreground">JST</div>
                          </div>
                          
                          <div className="w-px h-16 bg-border" />
                          
                          {/* Cover */}
                          <Link href={`/anime/${animeItem?.slug}`} className="flex-shrink-0">
                            <img 
                              src={item.thumbnail || animeItem?.coverImage || ""} 
                              alt={getAnimeName(item.animeId)}
                              className="w-14 h-20 object-cover rounded-lg group-hover:scale-105 transition-transform"
                            />
                          </Link>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link href={`/anime/${animeItem?.slug}`}>
                                <h3 className="font-semibold text-foreground hover:text-primary transition-colors truncate">
                                  {getAnimeName(item.animeId)}
                                </h3>
                              </Link>
                              {item.status === "airing" && (
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px] font-medium flex items-center gap-1">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                  </span>
                                  LIVE
                                </span>
                              )}
                              {item.status === "upcoming" && (
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-medium">
                                  UPCOMING
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{animeItem?.japaneseTitle}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
                              <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-lg font-medium">
                                <Tv className="h-3 w-3" />
                                S{item.season} E{item.episodeNumber}
                              </span>
                              {animeItem && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  {animeItem.rating}
                                </span>
                              )}
                              <div className="flex gap-1">
                                {animeItem?.genres.slice(0, 2).map(g => (
                                  <span key={g} className="px-2 py-0.5 bg-background/50 rounded text-muted-foreground">
                                    {g}
                                  </span>
                                ))}
                              </div>
                              {item.embedSources.length > 0 && (
                                <span className="text-muted-foreground">
                                  {item.embedSources.length} source{item.embedSources.length !== 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">📝 {item.notes}</p>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleNotification(item.id)}
                              className={`rounded-full h-9 w-9 ${
                                notifiedAnime.has(item.id.toString()) 
                                  ? "bg-primary/20 text-primary" 
                                  : "text-muted-foreground hover:text-primary"
                              }`}
                            >
                              <Bell className={`h-4 w-4 ${notifiedAnime.has(item.id.toString()) ? "fill-current" : ""}`} />
                            </Button>
                            <Link href={`/anime/${animeItem?.slug}`}>
                              <Button size="sm" className="rounded-lg gradient-primary gap-1.5">
                                <Play className="h-3 w-3 fill-current" />
                                Watch
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Timeline View */
                <div className="relative">
                  <div className="absolute left-[45px] top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-0">
                    {timeSlots.map(time => {
                      const itemsAtTime = schedule.filter(s => s.scheduledTime === time);
                      if (itemsAtTime.length === 0) return null;
                      
                      return (
                        <div key={time} className="relative flex gap-4 py-4">
                          {/* Time marker */}
                          <div className="w-[90px] flex-shrink-0 text-right pr-4">
                            <span className="text-sm font-medium text-primary">{time}</span>
                            <div className="text-[10px] text-muted-foreground">JST</div>
                          </div>
                          
                          {/* Dot on timeline */}
                          <div className="absolute left-[41px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background z-10" />
                          
                          {/* Content */}
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
                            {itemsAtTime.map(item => {
                              const animeItem = getAnime(item.animeId);
                              return (
                                <Link 
                                  key={item.id}
                                  href={`/anime/${animeItem?.slug}`}
                                  className="glass rounded-xl p-3 border border-border hover:border-primary/30 transition-all flex items-center gap-3 group"
                                >
                                  <img 
                                    src={item.thumbnail || animeItem?.coverImage || ""} 
                                    alt={getAnimeName(item.animeId)}
                                    className="w-12 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform"
                                  />
                                  <div className="min-w-0">
                                    <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                      {getAnimeName(item.animeId)}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">S{item.season} E{item.episodeNumber}</p>
                                    {item.status === "airing" && (
                                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded text-[9px] font-medium">
                                        LIVE
                                      </span>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-20 glass rounded-2xl">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No anime scheduled for {days[selectedDay]}</p>
                <p className="text-sm text-muted-foreground mt-1">Check back later for updates</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}