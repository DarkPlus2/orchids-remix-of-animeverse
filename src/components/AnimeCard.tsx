"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Anime } from "@/lib/types/anime";
import { Badge } from "@/components/ui/badge";

interface AnimeCardProps {
  anime: Anime;
  rank?: number;
  showRank?: boolean;
}

export function AnimeCard({ anime, rank, showRank }: AnimeCardProps) {
  return (
    <Link href={`/anime/${anime.slug}`} className="group block flex-shrink-0 w-28 md:w-32">
      <div className="anime-card-hover relative overflow-hidden rounded-xl bg-card border border-white/5 hover:border-primary/30 transition-all">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <Image
            src={anime.coverImage || ""}
            alt={anime.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 112px, 128px"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
            <div className="relative">
              <div className="absolute inset-0 rounded-full gradient-primary blur-lg opacity-60 scale-150" />
              <div className="relative rounded-full gradient-primary p-2 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                <Play className="h-3 w-3 fill-white text-white" />
              </div>
            </div>
          </div>
          
          {/* Airing status badge */}
          {anime.status === "ongoing" && (
            <div className="absolute top-1.5 left-1.5">
              <Badge className="gradient-primary text-white text-[8px] border-0 shadow-lg px-1.5 py-0.5">
                <span className="relative flex h-1 w-1 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1 w-1 bg-white"></span>
                </span>
                Airing
              </Badge>
            </div>
          )}

          {anime.status === "completed" && (
            <div className="absolute top-1.5 left-1.5">
              <Badge className="bg-white/20 backdrop-blur-sm text-white text-[8px] border-0 px-1.5 py-0.5">
                Completed
              </Badge>
            </div>
          )}
          
          {/* Rank badge */}
          {showRank && rank && (
            <div className="absolute top-1.5 right-1.5">
              <div className="flex items-center justify-center w-5 h-5 rounded-md gradient-primary text-white font-bold text-[10px] shadow-lg">
                #{rank}
              </div>
            </div>
          )}
          
          {/* Title overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <h3 className="line-clamp-2 font-medium text-xs text-white group-hover:text-primary-foreground transition-colors duration-300">
              {anime.title}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
}