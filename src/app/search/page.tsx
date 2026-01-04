"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { AnimeCard } from "@/components/AnimeCard";
import { Anime } from "@/lib/types/anime";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/anime?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Error searching anime:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Search Results
        </h1>
        {query && (
          <p className="text-muted-foreground">
            Showing results for &quot;{query}&quot;
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {results.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass rounded-2xl">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No results found
          </h2>
          <p className="text-muted-foreground">
            Try searching with different keywords
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <Suspense fallback={
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}