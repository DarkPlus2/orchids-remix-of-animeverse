"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, Eye, Users, Clock, PlayCircle, Film, RefreshCw,
  ArrowUpRight, TrendingUp, Heart, Star, Loader2, Tv, MessageSquare, MessageCircle, Activity,
  Zap, PieChart as PieChartIcon, Target, Globe, Zap as ZapIcon
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Anime {
  id: number;
  title: string;
  rating: number;
  genres: string[];
  status: string;
  type: string;
  totalEpisodes: number;
  trending: boolean;
  mostWatched: boolean;
  pinned: boolean;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [anime, setAnime] = useState<Anime[]>([]);
  const [communityStats, setCommunityStats] = useState<any>(null);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAnalytics();
  }, [isAdmin]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [animeRes, communityRes] = await Promise.all([
        fetch("/api/anime"),
        fetch("/api/community/stats")
      ]);

      if (animeRes.ok) {
        const animeData = await animeRes.json();
        setAnime(animeData);
      }

      if (communityRes.ok) {
        const communityData = await communityRes.json();
        setCommunityStats(communityData);
      }
    } catch (error) {
      toast.error("Telemetry synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  // Process data for charts
  const totalAnime = anime.length;
  const totalEpisodes = anime.reduce((sum, a) => sum + a.totalEpisodes, 0);
  const averageRating = anime.length > 0 ? (anime.reduce((sum, a) => sum + a.rating, 0) / anime.length).toFixed(1) : "0";
  
  const statusData = [
    { name: 'Ongoing', value: anime.filter(a => a.status === 'ongoing').length, color: '#10b981' },
    { name: 'Completed', value: anime.filter(a => a.status === 'completed').length, color: '#6366f1' },
  ];

  const typeData = [
    { name: 'Series', value: anime.filter(a => a.type === 'Series').length, color: '#a855f7' },
    { name: 'Movies', value: anime.filter(a => a.type === 'Movie').length, color: '#ec4899' },
  ];

  const genreCount: Record<string, number> = {};
  anime.forEach(a => a.genres.forEach(g => genreCount[g] = (genreCount[g] || 0) + 1));
  const genreDistribution = Object.entries(genreCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const stats = [
    { title: "Total Anime", value: totalAnime.toString(), icon: Film, color: "from-blue-500 to-cyan-500", trend: "+12.5%" },
    { title: "Total Episodes", value: totalEpisodes.toString(), icon: PlayCircle, color: "from-green-500 to-emerald-500", trend: "+8.2%" },
    { title: "Avg Rating", value: averageRating, icon: Star, color: "from-yellow-500 to-orange-500", trend: "+0.3" },
    { title: "Engagement", value: "94%", icon: Activity, color: "from-purple-500 to-violet-500", trend: "+4.1%" },
  ];

  return (
    <AdminLayout>
      <div className="w-full space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <BarChart3 className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter">Telemetry Hub</h1>
            </div>
            <p className="text-muted-foreground text-base md:text-xl font-medium ml-1">Advanced behavioral analytics and content performance</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-2xl border border-border/50">
              <Globe className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest opacity-70">Uplink: Active</span>
            </div>
            <Button variant="outline" size="lg" className="rounded-2xl h-14 w-14" onClick={fetchAnalytics}>
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <Loader2 className="h-16 w-16 animate-spin text-primary/20" />
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, i) => (
                <Card key={i} className="border-none shadow-2xl bg-card rounded-3xl md:rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                  <div className="p-6 md:p-8 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                        <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <Badge variant="outline" className="border-primary/20 text-primary font-black text-[10px] rounded-full px-2">
                        {stat.trend}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{stat.title}</p>
                      <h3 className="text-3xl md:text-4xl font-black tracking-tighter">{stat.value}</h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Engagement Matrix */}
              <Card className="xl:col-span-8 border-none shadow-2xl bg-card rounded-3xl md:rounded-[3.5rem] overflow-hidden">
                <CardHeader className="p-8 md:p-12 pb-0">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl md:text-3xl font-black tracking-tight">Growth Velocity</CardTitle>
                      <CardDescription className="font-medium text-sm md:text-base text-muted-foreground/60">30-day content acquisition and viewership sync</CardDescription>
                    </div>
                    <div className="p-3 rounded-2xl bg-muted/30">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 md:p-12 pt-10">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'W1', users: 4000, anime: 2400 },
                        { name: 'W2', users: 3000, anime: 1398 },
                        { name: 'W3', users: 2000, anime: 9800 },
                        { name: 'W4', users: 2780, anime: 3908 },
                        { name: 'W5', users: 1890, anime: 4800 },
                      ]}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.1} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 900 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 900 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', padding: '1.5rem' }}
                          itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                        />
                        <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Composition Breakdown */}
              <div className="xl:col-span-4 space-y-8">
                <Card className="border-none shadow-2xl bg-card rounded-3xl md:rounded-[3rem] p-8 md:p-10 space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                      <PieChartIcon className="h-5 w-5" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type Composition</h4>
                  </div>
                  <div className="h-[200px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeData}
                          cx="50%" cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {typeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black">{totalAnime}</span>
                      <span className="text-[8px] font-black uppercase opacity-40">Total Nodes</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {typeData.map(type => (
                      <div key={type.name} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }} />
                          <span className="text-xs font-black uppercase tracking-wider">{type.name}</span>
                        </div>
                        <span className="text-xs font-black">{type.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="border-none shadow-2xl bg-primary rounded-3xl md:rounded-[3rem] p-8 md:p-10 text-primary-foreground relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 blur-[100px] rounded-full group-hover:bg-white/20 transition-all duration-700" />
                  <div className="relative z-10 space-y-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-2xl font-black tracking-tight text-white italic">Node Distribution</h4>
                      <p className="opacity-80 font-medium text-xs text-white/90">Strategic content allocation across operational regions.</p>
                    </div>
                    <div className="space-y-3 pt-4">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-[70%] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/60">
                        <span>Ongoing Status</span>
                        <span>70%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Genre & Comms Table */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <Card className="xl:col-span-12 border-none shadow-2xl bg-card rounded-3xl md:rounded-[3.5rem] overflow-hidden">
                <div className="p-8 md:p-12">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                      <ZapIcon className="h-5 w-5" />
                    </div>
                    <h4 className="text-2xl font-black tracking-tight italic">Genre Core Dominance</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {genreDistribution.map((genre, i) => (
                      <div key={i} className="space-y-4 group">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-black uppercase tracking-tighter opacity-50 group-hover:opacity-100 transition-opacity">{genre.name}</span>
                          <span className="text-lg font-black text-primary">{genre.value}</span>
                        </div>
                        <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-1000 ease-out" 
                            style={{ width: `${(genre.value / totalAnime) * 100}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
