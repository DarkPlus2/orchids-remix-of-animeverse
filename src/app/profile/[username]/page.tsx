"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, Calendar, Clock, Heart, Play, List, 
  MessageSquare, Star, Zap, Flame, Target,
  Eye, History, ChevronRight, Share2,
  ExternalLink, MoreVertical, Search, Filter, BarChart3
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AnimeCard } from "@/components/AnimeCard";

interface UserProfile {
  id: number;
  username: string;
  name: string;
  bio: string | null;
  profilePicture: string | null;
  banner: string | null;
  favoriteGenres: string[];
  createdAt: string;
  stats: {
    favorites: number;
    watchlist: number;
    watched: number;
    comments: number;
  };
  activity: any[];
  favorites: any[];
  watchlist: any[];
  history: any[];
}

export default function ProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = params.username as string;
  const initialTab = searchParams.get("tab") || "overview";
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${username}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="w-full h-48 md:h-64 bg-muted animate-pulse" />
        <div className="container mx-auto px-4 -mt-16 md:-mt-20">
          <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
            <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-background" />
            <div className="flex-1 space-y-2 pb-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
            <div className="md:col-span-3">
              <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <Link href="/">
            <Button className="mt-4 gradient-primary">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Banner */}
      <div className="relative w-full h-48 md:h-80 overflow-hidden">
        {profile.banner ? (
          <img 
            src={profile.banner || ""} 
            alt="Profile Banner" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-20 md:-mt-28 relative z-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative group"
          >
            <Avatar className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] border-[6px] border-background shadow-2xl overflow-hidden ring-1 ring-white/10">
              <AvatarImage src={profile.profilePicture || ""} className="object-cover" />
              <AvatarFallback className="text-4xl font-bold bg-muted">
                {profile.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <div className="flex-1 space-y-3 pb-2 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                    {profile.name}
                  </h1>
                </div>
                <p className="text-muted-foreground font-medium">@{profile.username}</p>
              </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl gap-2 backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Link href="/profile/settings">
                    <Button size="sm" className="rounded-xl gap-2 gradient-primary shadow-lg shadow-primary/20">
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stats Card */}
              <Card className="rounded-[2rem] border-border bg-card/50 backdrop-blur-xl overflow-hidden group">
                <CardHeader className="pb-2 border-b border-border/50 bg-muted/20">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    User Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Watched</p>
                    <p className="text-2xl font-black text-foreground">{profile.stats.watched}</p>
                  </div>
                  <div className="space-y-1">
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Comments</p>
                    <p className="text-2xl font-black text-foreground">{profile.stats.comments}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Favorites</p>
                    <p className="text-2xl font-black text-primary">{profile.stats.favorites}</p>
                  </div>
                </CardContent>
              </Card>

              {/* About Card */}
              <Card className="rounded-[2rem] border-border bg-card/50 backdrop-blur-xl overflow-hidden">
                <CardHeader className="pb-2 border-b border-border/50 bg-muted/20">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                      {profile.bio || "No bio available."}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border/50 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                    </div>
                    {profile.favoriteGenres.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {profile.favoriteGenres.map(genre => (
                          <Badge key={genre} variant="secondary" className="bg-muted/50 border-white/5 text-[10px] font-bold">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full h-auto p-1 bg-muted/30 backdrop-blur-xl border border-border rounded-[2rem] grid grid-cols-2 md:grid-cols-4 gap-1">
                    <TabsTrigger value="overview" className="rounded-[1.5rem] py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20">
                      <Zap className="h-4 w-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-[1.5rem] py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <History className="h-4 w-4 mr-2" />
                      History
                    </TabsTrigger>
                    <TabsTrigger value="favorites" className="rounded-[1.5rem] py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Heart className="h-4 w-4 mr-2" />
                      Favorites
                    </TabsTrigger>
                    <TabsTrigger value="watchlist" className="rounded-[1.5rem] py-3 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <List className="h-4 w-4 mr-2" />
                      Watchlist
                    </TabsTrigger>
                  </TabsList>

                {/* Tab Contents */}
                <div className="mt-8">
                  <AnimatePresence mode="wait">
                    {activeTab === "overview" && (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                      >
                        {/* Continue Watching Section */}
                        {profile.history.length > 0 && (
                          <section>
                            <div className="flex items-center justify-between mb-4">
                              <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                                <Play className="h-5 w-5 text-primary" />
                                Continue Watching
                              </h2>
                              <Button variant="ghost" size="sm" onClick={() => setActiveTab("history")} className="gap-2 text-muted-foreground hover:text-primary rounded-xl">
                                View History <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {profile.history.slice(0, 4).map((item) => (
                                <Link key={item.id} href={`/anime/${item.slug}/watch/${item.episodeNumber}`}>
                                  <div className="group relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted border border-border hover:border-primary/50 transition-all hover:scale-[1.02]">
                                    <img src={item.coverImage || ""} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                    <div className="absolute bottom-3 left-3 right-3">
                                      <h3 className="text-xs font-black text-white truncate mb-1">{item.title}</h3>
                                      <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Episode {item.episodeNumber}</p>
                                      <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${item.progress}%` }} />
                                      </div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300">
                                        <Play className="h-5 w-5 fill-white" />
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </section>
                        )}

                        {/* Recent Activity Feed */}
                        <section>
                          <h2 className="text-xl font-black text-foreground flex items-center gap-2 mb-4">
                            <Flame className="h-5 w-5 text-orange-500" />
                            Recent Activity
                          </h2>
                          <div className="space-y-3">
                            {profile.activity.map((act) => (
                              <div key={act.id} className="group flex items-center gap-4 p-4 rounded-[1.5rem] bg-muted/30 border border-border hover:border-primary/30 transition-all hover:bg-muted/50">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                  {act.type === 'watch' && <Play className="h-6 w-6" />}
                                  {act.type === 'comment' && <MessageSquare className="h-6 w-6" />}
                                  {act.type === 'favorite' && <Heart className="h-6 w-6" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                    {act.content}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                      {new Date(act.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                {act.link && (
                                  <Link href={act.link}>
                                    <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            ))}
                            {profile.activity.length === 0 && (
                              <div className="text-center py-12 rounded-[2rem] bg-muted/20 border border-dashed border-border">
                                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                                <p className="text-muted-foreground font-bold">No activity recorded yet</p>
                              </div>
                            )}
                          </div>
                        </section>
                      </motion.div>
                    )}

                    {activeTab === "history" && (
                      <motion.div
                        key="history"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                      >
                        {profile.history.map((item) => (
                          <div key={item.id} className="space-y-2">
                            <AnimeCard anime={item as any} />
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center px-2">
                              Ep {item.episodeNumber} • {new Date(item.watchedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                        {profile.history.length === 0 && (
                          <div className="col-span-full text-center py-20">
                            <History className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground font-bold text-lg">Your history is empty</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "favorites" && (
                      <motion.div
                        key="favorites"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                      >
                        {profile.favorites.map((anime) => (
                          <AnimeCard key={anime.id} anime={anime} />
                        ))}
                        {profile.favorites.length === 0 && (
                          <div className="col-span-full text-center py-20">
                            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground font-bold text-lg">No favorites added</p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === "watchlist" && (
                      <motion.div
                        key="watchlist"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                      >
                        {profile.watchlist.map((anime) => (
                          <AnimeCard key={anime.id} anime={anime} />
                        ))}
                        {profile.watchlist.length === 0 && (
                          <div className="col-span-full text-center py-20">
                            <List className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground font-bold text-lg">Watchlist is empty</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Tabs>
            </div>
          </div>
      </div>

      {/* Spacing for mobile nav */}
      <div className="h-20 lg:h-0" />
    </div>
  );
}
