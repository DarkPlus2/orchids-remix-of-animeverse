"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { Anime } from "@/lib/types/anime";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface FeaturedCarouselProps {
  anime: Anime[];
}

const genres = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
  "Horror", "Romance", "Sci-Fi", "Slice of Life"
];

export function FeaturedCarousel({ anime }: FeaturedCarouselProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");
  const [overlayOpacity, setOverlayOpacity] = useState(70);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const router = useRouter();

  // Fetch banner settings
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const settings = await res.json();
          const bannerSetting = settings.find((s: any) => s.key === "carousel_banner_url");
          const opacitySetting = settings.find((s: any) => s.key === "carousel_overlay_opacity");
          
          if (bannerSetting?.value) {
            setBannerUrl(bannerSetting.value);
          }
          if (opacitySetting?.value) {
            setOverlayOpacity(parseInt(opacitySetting.value) || 70);
          }
        }
      } catch (error) {
        console.error("Failed to fetch banner:", error);
      }
    };
    fetchBanner();
  }, []);

  // Live search with debounce
  const searchAnime = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/anime?search=${encodeURIComponent(query)}`);
      if (res.ok) {
        const results = await res.json();
        setSearchResults(results.slice(0, 5));
        setShowResults(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchAnime(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchAnime]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="relative w-full py-10 md:py-12 overflow-hidden">
      {/* Background Banner Image */}
        {bannerUrl && (
          <div className="absolute inset-0 z-0">
            <img
              src={bannerUrl || ""}
              alt="Banner Background"
              className="w-full h-full object-cover"
              onLoad={() => setBannerLoaded(true)}
              onError={(e) => {
                console.error("Banner image failed to load:", bannerUrl);
                setBannerLoaded(false);
              }}
            />
          {/* Adjustable overlay - 0% = transparent, 100% = full black */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-black/50 via-black to-black"
            style={{ 
              opacity: overlayOpacity / 100
            }}
          />
          {/* Dark gradient at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
        </div>
      )}

      {/* Fallback animated background */}
      {(!bannerUrl || !bannerLoaded) && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          {/* Dark gradient at bottom for fallback */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
        </div>
      )}

      {/* Content */}
      <div className="relative container mx-auto px-4 z-10">
        <div className="max-w-3xl mx-auto space-y-5 text-center">
          {/* Simple Title */}
          <div className="space-y-2.5">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-2xl">
              Discover Your Next Favorite Anime
            </h1>
            <p className="text-sm md:text-base text-white/80 max-w-2xl mx-auto drop-shadow-lg">
              Stream thousands of anime episodes and movies in stunning quality
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70 transition-colors group-focus-within:text-primary" />
                <Input
                  type="search"
                  placeholder="Search for anime..."
                  className="w-full h-12 pl-14 pr-14 bg-transparent border border-gray-500/20 focus:border-gray-400/40 rounded-2xl text-white placeholder:text-white/50 text-base shadow-lg transition-all hover:border-gray-400/30"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                />
                {isSearching && (
                  <Loader2 className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary animate-spin" />
                )}
              </div>
            </form>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {searchResults.map((result) => (
                  <Link
                    key={result.id}
                    href={`/anime/${result.slug}`}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all group/item border-b border-border/50 last:border-0"
                    onClick={() => setShowResults(false)}
                  >
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-border group-hover/item:ring-primary transition-all">
                        <Image
                          src={result.coverImage || ""}
                          alt={result.title}
                          fill
                          className="object-cover group-hover/item:scale-110 transition-transform duration-300"
                        />
                      </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-foreground truncate group-hover/item:text-primary transition-colors">{result.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{result.genres.slice(0, 3).join(", ")}</p>
                    </div>
                  </Link>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  className="block p-4 text-center text-sm font-medium text-primary hover:bg-white/5 transition-all"
                  onClick={() => setShowResults(false)}
                >
                  View all results →
                </Link>
              </div>
            )}
          </div>

          {/* Genre Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {genres.map((genre) => (
              <Link
                key={genre}
                href={`/browse?genre=${genre.toLowerCase()}`}
              >
                <Badge 
                  variant="outline" 
                  className="px-3.5 py-1.5 bg-transparent border border-gray-500/20 text-white hover:bg-white/5 hover:border-gray-400/30 cursor-pointer transition-all hover:scale-105 shadow-md font-medium"
                >
                  {genre}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}