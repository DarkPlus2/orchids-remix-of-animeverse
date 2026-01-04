"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { cn } from "@/lib/utils";
import { 
  Users, Film, MessageSquare, Eye, TrendingUp, 
  ArrowUpRight, Activity, Zap, 
  BarChart3, Clock, PlayCircle, Star, Package,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Stats {
  totalAnime: number;
  totalEpisodes: number;
  featuredAnime: number;
  trendingAnime: number;
  ongoingAnime: number;
  completedAnime: number;
}

interface RecentAnime {
  id: string;
  title: string;
  coverImage: string;
  status: string;
  rating: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalAnime: 0,
    totalEpisodes: 0,
    featuredAnime: 0,
    trendingAnime: 0,
    ongoingAnime: 0,
    completedAnime: 0,
  });
  const [recentAnime, setRecentAnime] = useState<RecentAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [animeRes, episodesRes] = await Promise.all([
          fetch("/api/anime"),
          fetch("/api/episodes"),
        ]);

        const animeData = await animeRes.json();
        const episodesData = await episodesRes.json();

        setStats({
          totalAnime: animeData.length,
          totalEpisodes: Array.isArray(episodesData) ? episodesData.length : 0,
          featuredAnime: animeData.filter((a: any) => a.featured).length,
          trendingAnime: animeData.filter((a: any) => a.trending).length,
          ongoingAnime: animeData.filter((a: any) => a.status === "ongoing").length,
          completedAnime: animeData.filter((a: any) => a.status === "completed").length,
        });

        setRecentAnime(
          animeData
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6)
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!isAdmin) return null;

  const statCards = [
    {
      title: "Total Anime",
      value: stats.totalAnime,
      icon: Film,
      color: "from-violet-500 to-purple-500",
      link: "/admin/anime",
    },
    {
      title: "Total Episodes",
      value: stats.totalEpisodes,
      icon: PlayCircle,
      color: "from-blue-500 to-cyan-500",
      link: "/admin/episodes",
    },
    {
      title: "Featured",
      value: stats.featuredAnime,
      icon: Star,
      color: "from-yellow-500 to-orange-500",
      link: "/admin/anime",
    },
    {
      title: "Trending",
      value: stats.trendingAnime,
      icon: Eye,
      color: "from-green-500 to-emerald-500",
      link: "/admin/anime",
    },
  ];

  const quickActions = [
    { label: "Anime Management", href: "/admin/anime", icon: Film, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { label: "Episode Management", href: "/admin/episodes", icon: PlayCircle, color: "bg-green-500/10 text-green-500 border-green-500/20" },
    { label: "Community", href: "/admin/community", icon: MessageSquare, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3, color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  ];

  return (
    <AdminLayout>
      <div className="w-full space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">System Pulse</h1>
            </div>
            <p className="text-muted-foreground text-base md:text-xl font-medium ml-1">Real-time infrastructure and community analytics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-2xl border border-border/50">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-xs font-black uppercase tracking-widest opacity-70">Node Health: Optimal</span>
            </div>
            <Button size="lg" className="rounded-2xl h-14 px-8 gradient-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30">
              Generate Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.link}>
                <Card className="border-none shadow-2xl bg-card rounded-3xl md:rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                  <div className="p-6 md:p-8 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                        <Icon className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <Badge variant="outline" className="border-green-500/30 text-green-500 font-black text-[10px] rounded-full px-2">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> +12.5%
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{stat.title}</p>
                      <h3 className="text-3xl md:text-4xl font-black tracking-tighter">{loading ? "..." : stat.value}</h3>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <Card className="xl:col-span-8 border-none shadow-2xl bg-card rounded-3xl md:rounded-[3.5rem] overflow-hidden">
            <CardHeader className="p-8 md:p-12 pb-0">
              <CardTitle className="text-2xl md:text-3xl font-black tracking-tight">Recent Deployments</CardTitle>
              <CardDescription className="font-medium text-sm md:text-base">Latest anime synchronized to the edge network</CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-12">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-primary/20" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
                  {recentAnime.map((anime) => (
                    <Link key={anime.id} href={`/admin/anime`} className="group">
                      <div className="space-y-3">
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-xl">
                          <img
                            src={anime.coverImage}
                            alt={anime.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm font-black tracking-tight truncate group-hover:text-primary transition-colors">{anime.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="xl:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl bg-primary rounded-3xl md:rounded-[3rem] p-8 md:p-10 text-primary-foreground relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 blur-[100px] rounded-full group-hover:bg-white/20 transition-all duration-700" />
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl md:text-3xl font-black tracking-tight text-white">Direct Access</h4>
                  <p className="opacity-80 font-medium leading-relaxed text-sm md:text-base text-white/90">Rapid navigation to mission-critical governance modules.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {quickActions.map(action => (
                    <Link key={action.label} href={action.href}>
                      <Button variant="ghost" className="w-full h-12 rounded-xl bg-white/10 text-white hover:bg-white/20 font-black uppercase tracking-widest text-[10px] p-0 border border-white/5">
                        {action.label.split(' ')[0]}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-2xl bg-card rounded-3xl md:rounded-[3rem] p-8 md:p-10 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Operational State</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/30 border border-border/50">
                  <span className="text-xs font-bold">Ongoing Nodes</span>
                  <Badge className="bg-green-500/10 text-green-500 border-none font-black">{stats.ongoingAnime}</Badge>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-muted/30 border border-border/50">
                  <span className="text-xs font-bold">Completed Nodes</span>
                  <Badge className="bg-blue-500/10 text-blue-500 border-none font-black">{stats.completedAnime}</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
