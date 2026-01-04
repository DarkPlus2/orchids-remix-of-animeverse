"use client";

import { useState, useMemo } from "react";
import { ChevronRight, Play, Calendar, TrendingUp, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface Episode {
  id: number;
  animeId: number;
  episodeNumber: number;
  title: string;
  thumbnail?: string | null;
  season: number;
}

interface EpisodesListProps {
  episodes: Episode[];
  animeSlug?: string;
  currentEpisode?: number;
  className?: string;
}

export function EpisodesList({ 
  episodes, 
  animeSlug, 
  currentEpisode,
  className 
}: EpisodesListProps) {
  // Group episodes by season
  const seasonGroups = useMemo(() => {
    const groups = episodes.reduce((acc, ep) => {
      const season = ep.season || 1;
      if (!acc[season]) {
        acc[season] = [];
      }
      acc[season].push(ep);
      return acc;
    }, {} as Record<number, Episode[]>);

    // Sort episodes within each season
    Object.keys(groups).forEach(season => {
      groups[parseInt(season)].sort((a, b) => a.episodeNumber - b.episodeNumber);
    });

    return groups;
  }, [episodes]);

  const seasons = Object.keys(seasonGroups).map(Number).sort((a, b) => a - b);
  
  // Determine initial active season based on current episode
  const initialSeason = useMemo(() => {
    if (currentEpisode) {
      const episode = episodes.find(ep => ep.episodeNumber === currentEpisode);
      return episode?.season || seasons[0] || 1;
    }
    return seasons[0] || 1;
  }, [currentEpisode, episodes, seasons]);

  const [activeSeason, setActiveSeason] = useState(initialSeason);

  const currentSeasonEpisodes = seasonGroups[activeSeason] || [];

  if (episodes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No episodes available
      </div>
    );
  }

  // Get current season info for display
  const activeSeasonEps = seasonGroups[activeSeason] || [];
  const activeSeasonRange = activeSeasonEps.length > 0 
    ? `${activeSeasonEps[0].episodeNumber}-${activeSeasonEps[activeSeasonEps.length - 1].episodeNumber}`
    : "0";
  const activeSeasonCount = activeSeasonEps.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Advanced Modern Season Dropdown */}
      {seasons.length > 1 && (
        <div className="space-y-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[200px] justify-between bg-gradient-to-r from-card to-card/80 border-primary/30 hover:border-primary/50 hover:bg-card/90 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-bold text-foreground">Season {activeSeason}</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span>EP {activeSeasonRange}</span>
                    <span>•</span>
                    <span>{activeSeasonCount} episodes</span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="min-w-[240px] bg-card/95 backdrop-blur-xl border-border/50 shadow-xl"
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-3 py-2">
                {seasons.length} Season{seasons.length !== 1 ? 's' : ''} Available
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <div className="max-h-[300px] overflow-y-auto">
                {seasons.map((season) => {
                  const seasonEps = seasonGroups[season];
                  const episodeRange = seasonEps.length > 0 
                    ? `${seasonEps[0].episodeNumber}-${seasonEps[seasonEps.length - 1].episodeNumber}`
                    : "0";
                  const episodeCount = seasonEps.length;
                  const isActive = activeSeason === season;

                  return (
                    <DropdownMenuItem
                      key={season}
                      onClick={() => setActiveSeason(season)}
                      className={cn(
                        "cursor-pointer px-3 py-3 mx-1 my-0.5 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-primary/15 to-purple-600/15 border border-primary/30"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "text-sm font-bold",
                            isActive ? "text-primary" : "text-foreground"
                          )}>
                            Season {season}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              EP {episodeRange}
                            </span>
                            <span>•</span>
                            <span>{episodeCount} ep</span>
                          </div>
                        </div>
                        {isActive && (
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20">
                            <Check className="h-3.5 w-3.5 text-primary" />
                          </div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Episodes Grid - 3 Columns Layout */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-3">
        {currentSeasonEpisodes.map((episode) => {
          const isCurrentEpisode = currentEpisode === episode.episodeNumber;
          const href = animeSlug 
            ? `/anime/${animeSlug}/watch/${episode.episodeNumber}`
            : "#";

          return (
            <Link
              key={episode.id}
              href={href}
              className={cn(
                "group relative rounded-lg overflow-hidden transition-all duration-300",
                "hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/20",
                isCurrentEpisode && "ring-2 ring-primary shadow-lg shadow-primary/40"
              )}
            >
              {/* Episode Card - 16:9 Aspect Ratio */}
              <div className="relative aspect-video bg-gradient-to-br from-card to-card/80 overflow-hidden border border-border/30">
                {/* Thumbnail with proper Next.js Image */}
                {episode.thumbnail ? (
                  <Image
                    src={episode.thumbnail}
                    alt={`Episode ${episode.episodeNumber}`}
                    fill
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/15 via-purple-500/15 to-muted/40 flex flex-col items-center justify-center gap-1.5">
                    <div className="text-3xl sm:text-4xl md:text-5xl font-black text-primary/40 group-hover:scale-110 transition-transform">
                      {episode.episodeNumber}
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                      <Play className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 fill-primary/20" />
                    </div>
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

                {/* Small Episode Badge */}
                <div className="absolute top-1.5 left-1.5">
                  <Badge 
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold shadow-md transition-all duration-300",
                      isCurrentEpisode
                        ? "bg-gradient-to-r from-primary to-purple-600 text-white"
                        : "bg-black/70 backdrop-blur-sm text-white border-0 group-hover:bg-primary/80"
                    )}
                  >
                    {episode.episodeNumber}
                  </Badge>
                </div>

                {/* Currently Watching Indicator - Smaller */}
                {isCurrentEpisode && (
                  <div className="absolute top-1.5 right-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                  </div>
                )}

                {/* Episode Title - Compact */}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-[11px] sm:text-xs font-semibold text-white truncate leading-tight drop-shadow-lg">
                    {episode.title || `Episode ${episode.episodeNumber}`}
                  </p>
                </div>

                {/* Hover Play Button - Smaller */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center shadow-xl shadow-primary/50">
                    <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Season Info Footer */}
      <div className="flex items-center justify-between pt-1">
        <Badge variant="outline" className="text-xs font-medium border-primary/30">
          {currentSeasonEpisodes.length} Episode{currentSeasonEpisodes.length !== 1 ? 's' : ''}
          {seasons.length > 1 && ` • Season ${activeSeason}`}
        </Badge>
        {seasons.length > 1 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{seasons.length} Seasons Available</span>
          </div>
        )}
      </div>
    </div>
  );
}