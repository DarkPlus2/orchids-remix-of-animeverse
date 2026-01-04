"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, PlayCircle, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ContinueWatchingItem {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  episodeNumber: number;
  season: number;
  progress: number;
  watchedAt: string;
}

export function ContinueWatching() {
  const { user } = useAuth();
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/watch-history/continue");
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (error) {
        console.error("Error fetching watch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (!user || (!loading && items.length === 0)) return null;

  if (loading) {
    return (
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary/60">
            <Clock className="h-3.5 w-3.5 text-white" />
          </div>
          <h2 className="text-sm md:text-base font-bold text-foreground">
            Continue Watching
          </h2>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-28 md:w-32 space-y-2">
              <Skeleton className="aspect-[2/3] rounded-xl" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg gradient-primary">
          <Clock className="h-3.5 w-3.5 text-white" />
        </div>
        <h2 className="text-sm md:text-base font-bold text-foreground">
          Continue Watching
        </h2>
      </div>
      
          <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide">
            {items.map((item) => (
              <Link 
                key={item.id} 
                href={`/anime/${item.slug}/watch/${item.episodeNumber}`}
                className="group flex-shrink-0 w-28 md:w-32"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-1.5 border border-white/5 group-hover:border-primary/30 transition-all duration-300 shadow-lg">
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 112px, 128px"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full gradient-primary blur-lg opacity-60 scale-150" />
                      <div className="relative rounded-full gradient-primary p-2 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                        <Play className="h-3 w-3 fill-white text-white" />
                      </div>
                    </div>
                  </div>
    
                  <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                    <Badge className="gradient-primary text-white text-[8px] border-0 shadow-lg px-1.5 py-0.5">
                      EP {item.episodeNumber}
                    </Badge>
                    <Badge className="bg-black/60 backdrop-blur-sm text-white text-[8px] border-0 px-1.5 py-0.5">
                      S{item.season}
                    </Badge>
                  </div>
    
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <h3 className="text-[10px] font-medium text-white line-clamp-1 mb-1.5 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <div className="space-y-1">
                      <Progress value={item.progress} className="h-1 bg-white/10" />
                      <div className="flex justify-between items-center text-[7px] font-bold text-white/50 tracking-wider">
                        <span>{item.progress}%</span>
                        <span className="text-primary/70 uppercase">RESUME</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

    </section>
  );
}
