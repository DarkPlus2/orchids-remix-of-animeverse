"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/Navigation";
import { EpisodesList } from "@/components/EpisodesList";
import { CommentSection } from "@/components/comments/CommentSection";
import { Anime, Episode } from "@/lib/types/anime";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  List, 
  Play, 
  Server,
  Layers,
  Home,
  Info,
  MessageSquare
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Advanced skeleton loading component
function WatchPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-4 sm:mb-5 md:mb-6">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Video player skeleton with shimmer */}
            <div className="relative aspect-video bg-gradient-to-r from-muted via-muted/50 to-muted rounded-xl sm:rounded-2xl overflow-hidden">
              <div className="absolute inset-0 shimmer" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                  <Play className="h-8 w-8 text-primary/40" />
                </div>
              </div>
            </div>

            {/* Info section skeleton */}
            <div className="glass-strong rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 sm:h-7 md:h-8 w-3/4" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
                <Skeleton className="h-8 sm:h-9 w-16 sm:w-20" />
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Skeleton className="flex-1 h-9 sm:h-10" />
                <Skeleton className="flex-1 h-9 sm:h-10" />
              </div>
            </div>

            {/* Sources skeleton */}
            <div className="glass rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>

            {/* Episodes skeleton */}
            <div className="glass rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[...Array(12)].map((_, i) => (
                  <Skeleton key={i} className="aspect-video rounded-lg" />
                ))}
              </div>
            </div>

            {/* Anime info skeleton */}
            <div className="glass rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-5">
              <div className="flex gap-3 sm:gap-4">
                <Skeleton className="w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-14" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const episodeNumber = parseInt(params.episode as string);
  
  const [anime, setAnime] = useState<Anime | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [switchingEpisode, setSwitchingEpisode] = useState(false);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const res = await fetch(`/api/anime/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setAnime(data);
          const episode = data.episodes.find((ep: Episode) => ep.number === episodeNumber);
          setCurrentEpisode(episode || null);
          setActiveSourceIndex(0);
        }
      } catch (error) {
        console.error("Error fetching anime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, [slug]);

  // Separate effect for episode changes - no page reload
  useEffect(() => {
    if (anime) {
      const episode = anime.episodes.find((ep: Episode) => ep.number === episodeNumber);
      setCurrentEpisode(episode || null);
      setActiveSourceIndex(0);
      setSwitchingEpisode(false);
      
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [episodeNumber, anime]);

  const goToPreviousEpisode = () => {
    if (episodeNumber > 1) {
      setSwitchingEpisode(true);
      window.history.pushState(null, '', `/anime/${slug}/watch/${episodeNumber - 1}`);
      router.replace(`/anime/${slug}/watch/${episodeNumber - 1}`, { scroll: false });
    }
  };

  const goToNextEpisode = () => {
    if (anime && episodeNumber < anime.episodes.length) {
      setSwitchingEpisode(true);
      window.history.pushState(null, '', `/anime/${slug}/watch/${episodeNumber + 1}`);
      router.replace(`/anime/${slug}/watch/${episodeNumber + 1}`, { scroll: false });
    }
  };

  if (loading) {
    return <WatchPageSkeleton />;
  }

  if (!anime || !currentEpisode) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-40 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <Play className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-3">Episode Not Found</h1>
              <p className="text-muted-foreground">This episode doesn't exist or is not available yet.</p>
            </div>
            <Link href="/">
              <Button className="gap-2 bg-gradient-to-r from-primary to-purple-600">
                <Home className="h-4 w-4" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentSource = currentEpisode.embedSources[activeSourceIndex];

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

      <div className="pt-16">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-4 sm:mb-5 md:mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground flex-shrink-0" />
            <Link href={`/anime/${slug}`} className="text-muted-foreground hover:text-primary transition-colors line-clamp-1 max-w-[150px] sm:max-w-none">
              {anime.title}
            </Link>
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground font-medium whitespace-nowrap">Episode {episodeNumber}</span>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Video player with smooth transition */}
            <div className="relative aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-border/50">
              {switchingEpisode && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 backdrop-blur-sm">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                      <Play className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-white text-sm font-medium">Loading Episode {episodeNumber}...</p>
                  </div>
                </div>
              )}
              <iframe
                key={`${episodeNumber}-${activeSourceIndex}`}
                src={currentSource?.url || ""}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ pointerEvents: 'auto' }}
              />
            </div>

            <div className="glass-strong rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-5">
              <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-2 line-clamp-2">
                    {anime.title}
                  </h1>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <Badge variant="outline" className="gap-1 sm:gap-1.5 border-primary/30 text-xs sm:text-sm">
                      <Play className="h-3 w-3" />
                      Episode {episodeNumber}
                    </Badge>
                    {currentEpisode.season && (
                      <Badge variant="outline" className="gap-1 sm:gap-1.5 border-purple-500/30 text-xs sm:text-sm">
                        <Layers className="h-3 w-3" />
                        Season {currentEpisode.season}
                      </Badge>
                    )}
                    {currentEpisode.title && (
                      <span className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                        {currentEpisode.title}
                      </span>
                    )}
                  </div>
                </div>
                <Link href={`/anime/${slug}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 border-white/20 shrink-0 h-8 sm:h-9 text-xs sm:text-sm">
                    <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Info</span>
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  onClick={goToPreviousEpisode}
                  disabled={episodeNumber === 1 || switchingEpisode}
                  variant="outline"
                  className="flex-1 gap-1.5 sm:gap-2 border-white/20 disabled:opacity-50 h-9 sm:h-10 text-xs sm:text-sm transition-all hover:scale-105"
                >
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Previous</span>
                </Button>
                
                <Button
                  onClick={goToNextEpisode}
                  disabled={episodeNumber >= anime.episodes.length || switchingEpisode}
                  className="flex-1 gap-1.5 sm:gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 disabled:opacity-50 h-9 sm:h-10 text-xs sm:text-sm transition-all hover:scale-105"
                >
                  <span className="hidden xs:inline">Next Episode</span>
                  <span className="xs:hidden">Next</span>
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {currentEpisode.embedSources.length > 0 && (
              <div className="glass rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-5">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <Server className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h2 className="font-bold text-foreground text-sm sm:text-base">Video Sources</h2>
                  <Badge variant="secondary" className="text-xs">
                    {currentEpisode.embedSources.length} Available
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentEpisode.embedSources.map((source, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSourceIndex(index)}
                      className={`px-3.5 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        activeSourceIndex === index
                          ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25 scale-105"
                          : "bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50 hover:scale-105"
                      }`}
                    >
                      {source.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Episodes - Now inline for all screen sizes */}
            <div className="glass rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-5">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <List className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <h2 className="font-bold text-foreground text-sm sm:text-base">Episodes</h2>
                <Badge variant="secondary" className="text-xs">
                  {anime.episodes.length} Total
                </Badge>
              </div>
              <EpisodesList 
                episodes={episodesForList}
                animeSlug={anime.slug}
                currentEpisode={episodeNumber}
              />
            </div>

            {/* Comments Section */}
            <div className="glass rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-5">
              <CommentSection animeId={anime.id} />
            </div>

            <Link href={`/anime/${slug}`}>
              <div className="glass rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-5 hover:border-primary/50 border border-border/50 transition-all group">
                <div className="flex gap-3 sm:gap-4">
                  <div className="relative w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                    <Image
                      src={anime.coverImage}
                      alt={anime.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors text-sm sm:text-base">
                      {anime.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
                      {anime.synopsis}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <Badge variant="outline" className="text-xs">
                        {anime.type}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {anime.totalEpisodes} Episodes
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {anime.releaseYear}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}