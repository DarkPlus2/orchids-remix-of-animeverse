"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, Save, Loader2, Palette, Globe, RefreshCw, 
  ShieldCheck, Cpu, Server, Bell, Activity, MessageCircle, Users
} from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/lib/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings State
  const [siteName, setSiteName] = useState("Reenime");
  const [bannerUrl, setBannerUrl] = useState("");
  const [overlayOpacity, setOverlayOpacity] = useState(70);
  const [telegramUrl, setTelegramUrl] = useState("");
  const [discordUrl, setDiscordUrl] = useState("");
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  
  // Stats
  const [stats] = useState({
    databaseSize: "24.5 MB",
    uptime: "99.99%",
    version: "2.1.0-stable",
    lastBackup: "12:00 PM Today"
  });

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const settings = await res.json();
        const banner = settings.find((s: any) => s.key === "carousel_banner_url");
        const opacity = settings.find((s: any) => s.key === "carousel_overlay_opacity");
        const telegram = settings.find((s: any) => s.key === "telegram_url");
        const discord = settings.find((s: any) => s.key === "discord_url");
        const name = settings.find((s: any) => s.key === "site_name");
        
        if (banner) setBannerUrl(banner.value || "");
        if (opacity) setOverlayOpacity(parseInt(opacity.value) || 70);
        if (telegram) setTelegramUrl(telegram.value || "");
        if (discord) setDiscordUrl(discord.value || "");
        if (name) setSiteName(name.value || "Reenime");
      }
    } catch (error) {
      toast.error("Configuration synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (type: string, data: Record<string, string>) => {
    setSaving(true);
    try {
      const promises = Object.entries(data).map(([key, value]) => 
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value })
        })
      );
      
      await Promise.all(promises);
      toast.success(`${type} parameters updated successfully`);
    } catch (error) {
      toast.error(`System error during ${type.toLowerCase()} update`);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) return null;
  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <AdminLayout>
      <div className="w-full space-y-6 md:space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 rounded-2xl bg-primary/10 text-primary">
                <Settings className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Engine Config</h1>
            </div>
            <p className="text-muted-foreground text-base md:text-xl font-medium ml-1">Platform-wide variables and operational governance</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-2xl border border-border/50">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-xs font-black uppercase tracking-widest opacity-70">Latency: 24ms</span>
            </div>
            <Button variant="outline" size="lg" className="rounded-2xl h-12 w-12 md:h-14 md:w-14" onClick={fetchSettings}>
              <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="core" className="space-y-6 md:space-y-10">
          <div className="p-2 bg-muted/30 rounded-3xl md:rounded-[2.5rem] border border-border/50 flex md:inline-flex shadow-inner overflow-x-auto scrollbar-hide">
            <TabsList className="bg-transparent h-10 md:h-14 flex-nowrap">
              <TabsTrigger value="core" className="rounded-2xl md:rounded-[1.75rem] px-4 md:px-10 h-8 md:h-10 gap-2 data-[state=active]:bg-card data-[state=active]:shadow-2xl font-black uppercase tracking-widest text-[10px]">
                <Cpu className="h-4 w-4" /> <span className="hidden sm:inline">Core settings</span><span className="sm:hidden">Core</span>
              </TabsTrigger>
              <TabsTrigger value="visual" className="rounded-2xl md:rounded-[1.75rem] px-4 md:px-10 h-8 md:h-10 gap-2 data-[state=active]:bg-card data-[state=active]:shadow-2xl font-black uppercase tracking-widest text-[10px]">
                <Palette className="h-4 w-4" /> <span className="hidden sm:inline">Visual Identity</span><span className="sm:hidden">Visual</span>
              </TabsTrigger>
              <TabsTrigger value="comms" className="rounded-2xl md:rounded-[1.75rem] px-4 md:px-10 h-8 md:h-10 gap-2 data-[state=active]:bg-card data-[state=active]:shadow-2xl font-black uppercase tracking-widest text-[10px]">
                <Globe className="h-4 w-4" /> <span className="hidden sm:inline">Comms Channels</span><span className="sm:hidden">Comms</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="core" className="mt-0">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
              <div className="xl:col-span-8 space-y-6 md:space-y-8">
                <Card className="border-none shadow-2xl bg-card rounded-3xl md:rounded-[3rem] overflow-hidden">
                  <div className="p-6 md:p-10 space-y-6 md:space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight">System Identity</h3>
                        <p className="text-muted-foreground text-sm md:text-base font-medium">Configure primary identification variables</p>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-3 py-1.5 rounded-full hidden sm:flex">PRODUCTION NODE</Badge>
                    </div>

                    <div className="grid gap-6 md:gap-8">
                      <div className="space-y-3">
                        <Label className="font-black uppercase tracking-widest text-[10px] ml-1 opacity-50">Global Site Name</Label>
                        <Input 
                          value={siteName} 
                          onChange={(e) => setSiteName(e.target.value)}
                          className="h-12 md:h-16 rounded-xl md:rounded-[1.5rem] bg-muted/30 border-none shadow-inner text-lg md:text-xl font-bold px-6 md:px-8 focus-visible:ring-primary/20"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-2 md:pt-4">
                        <div className="p-6 md:p-8 rounded-2xl md:rounded-[2rem] bg-muted/20 border border-border/50 flex items-center justify-between group hover:bg-muted/40 transition-colors">
                          <div className="space-y-1">
                            <p className="font-black text-base md:text-lg">Maintenance Mode</p>
                            <p className="text-xs md:text-sm text-muted-foreground font-medium">Disable public endpoint access</p>
                          </div>
                          <Switch checked={isMaintenanceMode} onCheckedChange={setIsMaintenanceMode} className="data-[state=checked]:bg-primary scale-75 md:scale-100" />
                        </div>
                        <div className="p-6 md:p-8 rounded-2xl md:rounded-[2rem] bg-muted/20 border border-border/50 flex items-center justify-between group hover:bg-muted/40 transition-colors">
                          <div className="space-y-1">
                            <p className="font-black text-base md:text-lg">Open Registration</p>
                            <p className="text-xs md:text-sm text-muted-foreground font-medium">Allow new member synchronization</p>
                          </div>
                          <Switch checked={allowRegistration} onCheckedChange={setAllowRegistration} className="data-[state=checked]:bg-primary scale-75 md:scale-100" />
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleSaveSettings("Identity", { site_name: siteName })} 
                      disabled={saving} 
                      className="w-full h-14 md:h-16 rounded-xl md:rounded-[1.5rem] gradient-primary text-white font-black text-base md:text-lg shadow-2xl shadow-primary/30 group"
                    >
                      {saving ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Save className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />}
                      Deploy Configurations
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="xl:col-span-4 space-y-6 md:space-y-8">
                <Card className="border-none shadow-2xl bg-primary rounded-3xl md:rounded-[3rem] p-6 md:p-10 text-primary-foreground relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 blur-[100px] rounded-full group-hover:bg-white/20 transition-all duration-700" />
                  <div className="relative z-10 space-y-6 md:space-y-8">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-white/20 flex items-center justify-center">
                      <Server className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl md:text-3xl font-black tracking-tight text-white">System Health</h4>
                      <p className="opacity-80 font-medium leading-relaxed text-sm md:text-base text-white/90">Infrastructure performing within optimal parameters.</p>
                    </div>
                    <div className="space-y-4 pt-2 md:pt-4">
                      <div className="flex justify-between items-end border-b border-white/10 pb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Uptime</span>
                        <span className="font-black text-base md:text-lg">{stats.uptime}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-white/10 pb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Database Size</span>
                        <span className="font-black text-base md:text-lg">{stats.databaseSize}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Engine Version</span>
                        <span className="font-black text-base md:text-lg">{stats.version}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="border-none shadow-2xl bg-card rounded-3xl md:rounded-[3rem] p-6 md:p-10 space-y-4 md:space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Governance Tools</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl justify-between border-border bg-muted/10 hover:bg-muted/30 font-bold group px-4 md:px-6">
                      System Logs <Bell className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </Button>
                    <Button variant="outline" className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl justify-between border-border bg-muted/10 hover:bg-muted/30 font-bold group px-4 md:px-6">
                      Registry Audit <Users className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visual" className="mt-0">
            <Card className="border-none shadow-2xl bg-card rounded-3xl md:rounded-[3.5rem] overflow-hidden">
              <div className="p-6 md:p-12 space-y-8 md:space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="space-y-1">
                    <h3 className="text-2xl md:text-4xl font-black tracking-tight">Visual Interface</h3>
                    <p className="text-muted-foreground text-sm md:text-lg font-medium">Orchestrate the frontend atmosphere and presentation</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-16">
                  <div className="space-y-8 md:space-y-10">
                    <div className="space-y-4">
                      <Label className="font-black uppercase tracking-widest text-[10px] ml-2 opacity-50">Cinematic Banner Source</Label>
                      <Input 
                        value={bannerUrl} 
                        onChange={(e) => setBannerUrl(e.target.value)}
                        className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-muted/30 border-none shadow-inner font-medium px-6 md:px-8 focus-visible:ring-primary/20"
                        placeholder="https://content.storage.com/hero.jpg"
                      />
                    </div>

                    <div className="space-y-6 md:space-y-8 p-6 md:p-10 bg-muted/20 rounded-2xl md:rounded-[2.5rem] border border-border/50 shadow-inner">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <Label className="font-black uppercase tracking-widest text-[10px]">Overlay density</Label>
                          <p className="text-[10px] md:text-xs text-muted-foreground font-medium italic">Adjust transparency of the UI wash</p>
                        </div>
                        <span className="text-2xl md:text-4xl font-black text-primary">{overlayOpacity}%</span>
                      </div>
                      <Slider 
                        value={[overlayOpacity]} 
                        onValueChange={(v) => setOverlayOpacity(v[0])} 
                        max={100} step={1} 
                        className="py-4 md:py-6"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="font-black uppercase tracking-widest text-[10px] ml-2 opacity-50">Interface Simulation</Label>
                    <div className="relative aspect-video rounded-2xl md:rounded-[3rem] overflow-hidden border-[6px] md:border-[12px] border-muted shadow-2xl bg-zinc-950 group">
                      {bannerUrl ? (
                        <img src={bannerUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Preview" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/10 italic text-muted-foreground/30 font-black text-xl md:text-2xl text-white">
                          NO SIGNAL
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/80 transition-opacity duration-500" style={{ opacity: overlayOpacity/100 }} />
                      <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12">
                        <div className="text-center space-y-2 md:space-y-4">
                          <div className="h-1 bg-primary w-12 md:w-24 mx-auto rounded-full shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
                          <h2 className="text-2xl md:text-6xl font-black text-white tracking-tighter uppercase">{siteName}</h2>
                          <div className="flex justify-center gap-2 md:gap-4 pt-2 md:pt-4">
                            <div className="w-8 md:w-12 h-1 md:h-2 rounded-full bg-white/20" />
                            <div className="w-12 md:w-20 h-1 md:h-2 rounded-full bg-white/20" />
                            <div className="w-8 md:w-12 h-1 md:h-2 rounded-full bg-white/20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSettings("Interface", { carousel_banner_url: bannerUrl, carousel_overlay_opacity: overlayOpacity.toString() })} 
                  disabled={saving} 
                  className="w-full h-16 md:h-20 rounded-xl md:rounded-[2rem] gradient-primary font-black text-lg md:text-2xl text-white shadow-2xl hover:scale-[1.01] transition-all"
                >
                  {saving ? <Loader2 className="h-8 w-8 animate-spin mr-4" /> : <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 mr-4" />}
                  Deploy Visual Synchronizer
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="comms" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              <Card className="border-none shadow-2xl bg-card rounded-3xl md:rounded-[3.5rem] overflow-hidden group">
                <div className="h-2 md:h-3 bg-gradient-to-r from-sky-400 to-sky-600" />
                <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-sky-500/10 text-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/5 group-hover:scale-110 transition-transform">
                      <MessageCircle className="h-8 w-8 md:h-10 md:w-10" />
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                      <h3 className="text-2xl md:text-3xl font-black italic">Telegram</h3>
                      <p className="text-muted-foreground text-sm font-medium">Community Dispatch Portal</p>
                    </div>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <Label className="font-black uppercase tracking-widest text-[10px] ml-2 opacity-50">Dispatch URL</Label>
                    <Input 
                      value={telegramUrl} 
                      onChange={(e) => setTelegramUrl(e.target.value)}
                      className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-muted/30 border-none px-6 text-base md:text-lg font-bold"
                      placeholder="t.me/reenime_official"
                    />
                  </div>
                  <Button 
                    className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-base md:text-lg shadow-xl shadow-sky-500/20"
                    onClick={() => handleSaveSettings("Telegram", { telegram_url: telegramUrl })}
                    disabled={saving}
                  >
                    Update Community Hub
                  </Button>
                </div>
              </Card>

              <Card className="border-none shadow-2xl bg-card rounded-3xl md:rounded-[3.5rem] overflow-hidden group">
                <div className="h-2 md:h-3 bg-gradient-to-r from-indigo-500 to-violet-600" />
                <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/5 group-hover:scale-110 transition-transform">
                      <Users className="h-8 w-8 md:h-10 md:w-10" />
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                      <h3 className="text-2xl md:text-3xl font-black italic">Discord</h3>
                      <p className="text-muted-foreground text-sm font-medium">Core Member Enclave</p>
                    </div>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <Label className="font-black uppercase tracking-widest text-[10px] ml-2 opacity-50">Invite Identifier</Label>
                    <Input 
                      value={discordUrl} 
                      onChange={(e) => setDiscordUrl(e.target.value)}
                      className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-muted/30 border-none px-6 text-base md:text-lg font-bold"
                      placeholder="discord.gg/reenime"
                    />
                  </div>
                  <Button 
                    className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base md:text-lg shadow-xl shadow-indigo-600/20"
                    onClick={() => handleSaveSettings("Discord", { discord_url: discordUrl })}
                    disabled={saving}
                  >
                    Update Social Mesh
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
