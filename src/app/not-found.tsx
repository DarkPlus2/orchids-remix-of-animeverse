import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft, Film, TrendingUp, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Animated 404 */}
        <div className="relative">
          <div className="text-[150px] md:text-[200px] font-bold leading-none bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="h-20 w-20 md:h-32 md:w-32 text-primary/20 animate-pulse" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Oops! The anime you're looking for seems to have gone on a side quest. 
            Let's get you back on track!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Home className="h-5 w-5" />
              Back to Home
            </Button>
          </Link>
          <Link href="/search">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Search className="h-5 w-5" />
              Search Anime
            </Button>
          </Link>
        </div>

        {/* Suggestions */}
        <div className="glass rounded-2xl p-6 border border-border space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Explore Instead
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/trending">
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:border-orange-500/40 transition-all group">
                <TrendingUp className="h-6 w-6 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-sm">Trending</p>
                <p className="text-xs text-muted-foreground">Hot anime now</p>
              </div>
            </Link>
            <Link href="/browse">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all group">
                <Film className="h-6 w-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-sm">Browse</p>
                <p className="text-xs text-muted-foreground">All anime</p>
              </div>
            </Link>
            <Link href="/schedule">
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all group">
                <Compass className="h-6 w-6 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-sm">Schedule</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Error Code */}
        <p className="text-xs text-muted-foreground">
          Error Code: 404 | Page Not Found
        </p>
      </div>
    </div>
  );
}
