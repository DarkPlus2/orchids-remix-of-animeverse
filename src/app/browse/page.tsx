"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { AnimeCard } from "@/components/AnimeCard";
import { Anime } from "@/lib/types/anime";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Library, Search, Filter, Grid3X3, LayoutList, ChevronDown, X, 
  SortAsc, SortDesc, Star, Calendar, Clock, TrendingUp, Sparkles, Eye, Pin, Film, Tv
} from "lucide-react";

const genres = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
  "Horror", "Romance", "Sci-Fi", "Slice of Life", "Sports",
  "Mystery", "Thriller", "Supernatural", "Mecha", "Music"
];

const years = Array.from({ length: 30 }, (_, i) => 2024 - i);

const sortOptions = [
  { value: "title-asc", label: "Title A-Z", icon: SortAsc },
  { value: "title-desc", label: "Title Z-A", icon: SortDesc },
  { value: "rating-desc", label: "Highest Rated", icon: Star },
  { value: "rating-asc", label: "Lowest Rated", icon: Star },
  { value: "year-desc", label: "Newest First", icon: Calendar },
  { value: "year-asc", label: "Oldest First", icon: Calendar },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "TV", label: "TV Series" },
  { value: "Movie", label: "Movie" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("title-asc");

  useEffect(() => {
    // Initialize filters from URL params
    const genre = searchParams.get("genre");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const sort = searchParams.get("sort");
    const mostWatched = searchParams.get("mostWatched");
    const pinned = searchParams.get("pinned");
    const letter = searchParams.get("letter");
    
    if (genre) setSelectedGenres([genre]);
    if (status) setSelectedStatus(status);
    if (type) {
      // Map URL param to type option
      if (type === "movie") setSelectedType("Movie");
      else setSelectedType(type);
    }
    if (sort) setSortBy(sort === "rating" ? "rating-desc" : sort === "year" ? "year-desc" : sort);
    
    // Handle special filters
    if (mostWatched === "true") {
      // Could add a flag or handle specially
    }
    if (pinned === "true") {
      // Could add a flag or handle specially
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const res = await fetch("/api/anime");
        const data = await res.json();
        setAnimeList(data);
      } catch (error) {
        console.error("Error fetching anime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
  }, []);

  // Filter and sort anime
  const filteredAnime = useMemo(() => {
    let result = [...animeList];
    
    // Special URL filters
    const mostWatched = searchParams.get("mostWatched");
    const pinned = searchParams.get("pinned");
    const letter = searchParams.get("letter");
    
    if (mostWatched === "true") {
      result = result.filter(a => a.mostWatched);
    }
    
    if (pinned === "true") {
      result = result.filter(a => a.pinned);
    }
    
    if (letter) {
      result = result.filter(a => {
        const firstChar = a.title.charAt(0).toUpperCase();
        if (letter === "other") {
          return !/[A-Z]/.test(firstChar);
        }
        return firstChar === letter.toUpperCase();
      });
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.japaneseTitle?.toLowerCase().includes(query)
      );
    }
    
    // Genre filter
    if (selectedGenres.length > 0) {
      result = result.filter(a => 
        selectedGenres.some(g => a.genres.map(genre => genre.toLowerCase()).includes(g.toLowerCase()))
      );
    }
    
    // Year filter
    if (selectedYear !== "all") {
      result = result.filter(a => a.releaseYear === parseInt(selectedYear));
    }
    
    // Status filter
    if (selectedStatus !== "all") {
      result = result.filter(a => a.status === selectedStatus);
    }
    
    // Type filter
    if (selectedType !== "all") {
      result = result.filter(a => a.type === selectedType);
    }
    
    // Sort
    const [sortField, sortOrder] = sortBy.split("-");
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "rating") {
        comparison = a.rating - b.rating;
      } else if (sortField === "year") {
        comparison = a.releaseYear - b.releaseYear;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });
    
    return result;
  }, [animeList, searchQuery, selectedGenres, selectedYear, selectedStatus, selectedType, sortBy, searchParams]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenres([]);
    setSelectedYear("all");
    setSelectedStatus("all");
    setSelectedType("all");
    setSortBy("title-asc");
    router.push("/browse");
  };

  const hasActiveFilters = searchQuery || selectedGenres.length > 0 || selectedYear !== "all" || selectedStatus !== "all" || selectedType !== "all" || searchParams.toString();

  // Get page title based on URL params
  const getPageTitle = () => {
    const mostWatched = searchParams.get("mostWatched");
    const pinned = searchParams.get("pinned");
    const letter = searchParams.get("letter");
    
    if (mostWatched === "true") return "Most Watched Anime";
    if (pinned === "true") return "Pinned Anime";
    if (letter) return `Anime Starting with ${letter === "other" ? "#" : letter.toUpperCase()}`;
    return "Browse Anime";
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Library className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {getPageTitle()}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {filteredAnime.length} anime found
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-lg"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="rounded-lg"
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="glass rounded-2xl p-4 mb-6 border border-border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search anime by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border rounded-xl"
            />
          </div>
          
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            
            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-2 rounded-xl ${showFilters ? 'bg-primary/20 border-primary' : ''}`}
            >
              <Filter className="h-4 w-4" />
              Genres
              {selectedGenres.length > 0 && (
                <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                  {selectedGenres.length}
                </span>
              )}
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
        
        {/* Genre Pills */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground mb-3">Select Genres</p>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedGenres.includes(genre)
                      ? "bg-primary text-primary-foreground"
                      : "bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background border border-border"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedGenres.map(genre => (
            <span
              key={genre}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
            >
              {genre}
              <button onClick={() => toggleGenre(genre)} className="hover:text-primary-foreground">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3"
          : "space-y-3"
        }>
          {[...Array(16)].map((_, i) => (
            <Skeleton key={i} className={viewMode === "grid" ? "aspect-[2/3] rounded-lg" : "h-24 rounded-lg"} />
          ))}
        </div>
      ) : filteredAnime.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAnime.map((anime) => (
              <div key={anime.id} className="glass rounded-xl p-4 flex gap-4 hover:border-primary/30 border border-border transition-colors group">
                <img 
                  src={anime.coverImage} 
                  alt={anime.title}
                  className="w-20 h-28 object-cover rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors text-lg">
                    {anime.title}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate mb-2">{anime.japaneseTitle}</p>
                  <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-yellow-500">{anime.rating}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {anime.releaseYear}
                    </span>
                    <span className="flex items-center gap-1">
                      {anime.type === "Movie" ? <Film className="h-3 w-3" /> : <Tv className="h-3 w-3" />}
                      {anime.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      anime.status === 'ongoing' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {anime.status === 'ongoing' ? 'Airing' : 'Completed'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {anime.genres.slice(0, 4).map(g => (
                      <span key={g} className="px-2 py-0.5 bg-background/50 rounded text-xs text-muted-foreground border border-border/50">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-20 glass rounded-2xl">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No anime found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your filters or search query</p>
          <Button variant="outline" onClick={clearFilters} className="rounded-xl">
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Suspense fallback={
        <div className="container mx-auto px-4 pt-24 pb-12">
          <Skeleton className="h-20 w-full mb-6 rounded-2xl" />
          <Skeleton className="h-16 w-full mb-6 rounded-2xl" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {[...Array(16)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        </div>
      }>
        <BrowseContent />
      </Suspense>
    </div>
  );
}