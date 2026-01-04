"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Edit, Trash2, Search, Filter, PlayCircle, ExternalLink,
  MoreHorizontal, RefreshCw, Loader2, ChevronLeft, ChevronRight, Film, Video,
  Calendar, Clock, Bell, CalendarClock, CalendarDays, Timer, AlertCircle,
  CheckCircle, XCircle, Eye, TrendingUp, Zap, X, Upload, Download, List, FileSpreadsheet,
  Settings2, Copy, Layers, LayoutGrid, CheckSquare, Square
} from "lucide-react";
import { toast } from "sonner";
import { Anime } from "@/lib/types/anime";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface EmbedSource {
  name: string;
  url: string;
}

interface Episode {
  id: number;
  animeId: number;
  episodeNumber: number;
  title: string;
  season: number;
  embedSources: EmbedSource[];
  thumbnail: string | null;
  createdAt: string;
}

interface ScheduledEpisode {
  id: number;
  animeId: number;
  episodeNumber: number;
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "upcoming" | "airing" | "aired" | "delayed";
  notifyUsers: boolean;
  streamUrl: string | null;
  notes: string | null;
  season: number;
  embedSources: EmbedSource[];
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function EpisodeManagementPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledEpisode | null>(null);
  const [selectedEpisodes, setSelectedEpisodes] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [animeFilter, setAnimeFilter] = useState<string>("all");
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("episodes");
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const itemsPerPage = 15;

  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [showBulkPreview, setShowBulkPreview] = useState(false);

  const [formData, setFormData] = useState({
    animeId: "",
    episodeNumber: "1",
    title: "",
    season: "1",
    embedSources: [{ name: "", url: "" }] as EmbedSource[],
    thumbnail: "",
  });

  const [scheduleFormData, setScheduleFormData] = useState({
    animeId: "",
    episodeNumber: "1",
    title: "",
    season: "1",
    scheduledDate: "",
    scheduledTime: "",
    notifyUsers: true,
    embedSources: [{ name: "", url: "" }] as EmbedSource[],
    thumbnail: "",
    notes: "",
  });

  const [bulkFormData, setBulkFormData] = useState({
    animeId: "",
    season: "1",
    startEpisode: "1",
    endEpisode: "12",
    titleTemplate: "Episode {number}",
    embedSources: [{ name: "Streamtape", url: "" }] as EmbedSource[],
    thumbnail: "",
    useCustomTitles: false,
    customTitles: "",
    useCustomSources: false,
    customSources: "", // JSON or CSV format
    useCustomThumbnails: false,
    customThumbnails: "",
  });

  const [bulkEditData, setBulkEditData] = useState({
    season: "",
    sourceName: "",
    sourceUrlTemplate: "",
  });

  // Real scheduled episodes from API
  const [scheduledEpisodes, setScheduledEpisodes] = useState<ScheduledEpisode[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = episodes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ep) =>
          ep.title.toLowerCase().includes(query) ||
          ep.episodeNumber.toString().includes(query) ||
          getAnimeName(ep.animeId).toLowerCase().includes(query)
      );
    }

    if (animeFilter !== "all") {
      filtered = filtered.filter((ep) => ep.animeId.toString() === animeFilter);
    }

    setFilteredEpisodes(filtered);
    setCurrentPage(1);
  }, [episodes, searchQuery, animeFilter]);

  const fetchData = async () => {
    try {
      const [episodesRes, animeRes, scheduledRes] = await Promise.all([
        fetch("/api/episodes"),
        fetch("/api/anime"),
        fetch("/api/scheduled-episodes"),
      ]);

      const episodesData = await episodesRes.json();
      const animeData = await animeRes.json();
      const scheduledData = await scheduledRes.json();

      setEpisodes(Array.isArray(episodesData) ? episodesData : []);
      setAnimeList(animeData);
      setScheduledEpisodes(Array.isArray(scheduledData) ? scheduledData : []);
      setFilteredEpisodes(Array.isArray(episodesData) ? episodesData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getAnimeName = (animeId: number) => {
    const anime = animeList.find((a) => parseInt(a.id) === animeId);
    return anime?.title || "Unknown";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const validSources = formData.embedSources.filter(
      (source) => source.name.trim() && source.url.trim()
    );

    if (validSources.length === 0) {
      toast.error("Please add at least one embed source");
      setSubmitting(false);
      return;
    }

    const episodeData = {
      animeId: parseInt(formData.animeId),
      episodeNumber: parseInt(formData.episodeNumber),
      title: formData.title,
      season: parseInt(formData.season),
      embedSources: validSources,
      thumbnail: formData.thumbnail || null,
    };

    try {
      if (editingEpisode) {
        const res = await fetch(`/api/episodes/${editingEpisode.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(episodeData),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("Episode updated successfully");
      } else {
        const res = await fetch("/api/episodes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(episodeData),
        });
        if (!res.ok) throw new Error("Failed to create");
        toast.success("Episode created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving episode:", error);
      toast.error("Failed to save episode");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkPreview = () => {
    const startEp = parseInt(bulkFormData.startEpisode);
    const endEp = parseInt(bulkFormData.endEpisode);

    if (!bulkFormData.animeId) {
      toast.error("Please select an anime first");
      return;
    }

    if (startEp > endEp) {
      toast.error("Start episode must be less than end episode");
      return;
    }

    const preview = [];
    const customTitlesArray = bulkFormData.useCustomTitles
      ? bulkFormData.customTitles.split("\n").filter(t => t.trim())
      : [];
    
    const customThumbnailsArray = bulkFormData.useCustomThumbnails
      ? bulkFormData.customThumbnails.split("\n").filter(t => t.trim())
      : [];
    
    const customSourcesArray = bulkFormData.useCustomSources
      ? bulkFormData.customSources.split("\n").filter(s => s.trim())
      : [];

    for (let epNum = startEp; epNum <= endEp; epNum++) {
      const arrayIdx = epNum - startEp;
      
      const episodeTitle = bulkFormData.useCustomTitles
        ? customTitlesArray[arrayIdx] || `Episode ${epNum}`
        : bulkFormData.titleTemplate.replace("{number}", epNum.toString());

        let episodeSources = [];
        if (bulkFormData.useCustomSources) {
          const line = customSourcesArray[arrayIdx] || "";
          if (line.trim()) {
            try {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith("[") || trimmedLine.startsWith("{")) {
                const parsed = JSON.parse(trimmedLine);
                episodeSources = Array.isArray(parsed) 
                  ? parsed.map((s: any, idx: number) => ({
                      name: s.name || `Server ${idx + 1}`,
                      url: s.url || s
                    }))
                  : [{ name: "Server 1", url: trimmedLine }];
              } else {
                // Split by comma for multiple servers on one line
                const urls = line.split(",").map(u => u.trim()).filter(u => u);
                episodeSources = urls.map((url, idx) => ({
                  name: `Server ${idx + 1}`,
                  url: url
                }));
              }
            } catch (e) {
              const urls = line.split(",").map(u => u.trim()).filter(u => u);
              episodeSources = urls.map((url, idx) => ({
                name: `Server ${idx + 1}`,
                url: url
              }));
            }
          }
        } else {

        episodeSources = bulkFormData.embedSources
          .filter(s => s.name && s.url)
          .map(source => ({
            name: source.name,
            url: source.url.replace("{number}", epNum.toString()),
          }));
      }

      const episodeThumbnail = bulkFormData.useCustomThumbnails
        ? (customThumbnailsArray[arrayIdx]?.trim() || null)
        : (bulkFormData.thumbnail ? bulkFormData.thumbnail.replace("{number}", epNum.toString()) : null);

      preview.push({
        episodeNumber: epNum,
        title: episodeTitle,
        sources: episodeSources,
        thumbnail: episodeThumbnail,
        isEditing: false,
      });
    }

    setBulkPreview(preview);
    setShowBulkPreview(true);
  };

  const updatePreviewItem = (index: number, field: string, value: any) => {
    const newPreview = [...bulkPreview];
    newPreview[index] = { ...newPreview[index], [field]: value };
    setBulkPreview(newPreview);
  };

  const updatePreviewSource = (itemIndex: number, sourceIndex: number, field: "name" | "url", value: string) => {
    const newPreview = [...bulkPreview];
    const newSources = [...newPreview[itemIndex].sources];
    newSources[sourceIndex] = { ...newSources[sourceIndex], [field]: value };
    newPreview[itemIndex].sources = newSources;
    setBulkPreview(newPreview);
  };

  const addPreviewSource = (itemIndex: number) => {
    const newPreview = [...bulkPreview];
    newPreview[itemIndex].sources = [...newPreview[itemIndex].sources, { name: "New Source", url: "" }];
    setBulkPreview(newPreview);
  };

  const removePreviewSource = (itemIndex: number, sourceIndex: number) => {
    const newPreview = [...bulkPreview];
    newPreview[itemIndex].sources = newPreview[itemIndex].sources.filter((_: any, i: number) => i !== sourceIndex);
    setBulkPreview(newPreview);
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBulkPreview) {
      handleBulkPreview();
      return;
    }

    setSubmitting(true);
    setBulkProgress(0);

    const startEp = parseInt(bulkFormData.startEpisode);
    const endEp = parseInt(bulkFormData.endEpisode);
    const total = endEp - startEp + 1;

    try {
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < bulkPreview.length; i++) {
        const previewItem = bulkPreview[i];
        const episodeData = {
          animeId: parseInt(bulkFormData.animeId),
          episodeNumber: previewItem.episodeNumber,
          title: previewItem.title,
          season: parseInt(bulkFormData.season),
          embedSources: previewItem.sources,
          thumbnail: previewItem.thumbnail,
        };

        try {
          const res = await fetch("/api/episodes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(episodeData),
          });
          if (res.ok) successCount++;
          else failCount++;
        } catch (error) {
          failCount++;
        }
        
        setBulkProgress(Math.round(((i + 1) / total) * 100));
      }

      toast.success(`Done! Created ${successCount} episodes. ${failCount} failed.`);
      setIsBulkDialogOpen(false);
      setShowBulkPreview(false);
      resetBulkForm();
      fetchData();
    } catch (error) {
      console.error("Error bulk creating episodes:", error);
      toast.error("Critical failure during bulk creation");
    } finally {
      setSubmitting(false);
      setBulkProgress(0);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedEpisodes.length === 0) return;
    setSubmitting(true);

    try {
      let successCount = 0;
      for (const id of selectedEpisodes) {
        const ep = episodes.find(e => e.id === id);
        if (!ep) continue;

        const updatedData: any = {};
        if (bulkEditData.season) updatedData.season = parseInt(bulkEditData.season);
        
        if (bulkEditData.sourceName && bulkEditData.sourceUrlTemplate) {
          const newSource = {
            name: bulkEditData.sourceName,
            url: bulkEditData.sourceUrlTemplate.replace("{number}", ep.episodeNumber.toString())
          };
          updatedData.embedSources = [...ep.embedSources, newSource];
        }

        const res = await fetch(`/api/episodes/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });
        if (res.ok) successCount++;
      }
      toast.success(`Updated ${successCount} episodes`);
      setIsBulkEditOpen(false);
      setSelectedEpisodes([]);
      fetchData();
    } catch (e) {
      toast.error("Failed to perform bulk update");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEpisodes.length === 0) {
      toast.error("No episodes selected");
      return;
    }

    setSubmitting(true);
    let successCount = 0;

    for (const id of selectedEpisodes) {
      try {
        const res = await fetch(`/api/episodes/${id}`, { method: "DELETE" });
        if (res.ok) successCount++;
      } catch (error) {}
    }

    toast.success(`Deleted ${successCount} episodes`);
    setSelectedEpisodes([]);
    fetchData();
    setSubmitting(false);
  };

  const toggleEpisodeSelection = (id: number) => {
    setSelectedEpisodes(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAllEpisodes = () => {
    if (selectedEpisodes.length === paginatedEpisodes.length) {
      setSelectedEpisodes([]);
    } else {
      setSelectedEpisodes(paginatedEpisodes.map(ep => ep.id));
    }
  };

  const handleEdit = (episode: Episode) => {
    setEditingEpisode(episode);
    setFormData({
      animeId: episode.animeId.toString(),
      episodeNumber: episode.episodeNumber.toString(),
      title: episode.title,
      season: episode.season.toString(),
      embedSources: episode.embedSources.length > 0 ? episode.embedSources : [{ name: "", url: "" }],
      thumbnail: episode.thumbnail || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this episode?")) return;
    try {
      const res = await fetch(`/api/episodes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Episode deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete episode");
    }
  };

  const addEmbedSource = () => {
    setFormData({ ...formData, embedSources: [...formData.embedSources, { name: "", url: "" }] });
  };

  const removeEmbedSource = (index: number) => {
    setFormData({ ...formData, embedSources: formData.embedSources.filter((_, i) => i !== index) });
  };

  const updateEmbedSource = (index: number, field: "name" | "url", value: string) => {
    const updatedSources = [...formData.embedSources];
    updatedSources[index][field] = value;
    setFormData({ ...formData, embedSources: updatedSources });
  };

  const addBulkEmbedSource = () => {
    setBulkFormData({ ...bulkFormData, embedSources: [...bulkFormData.embedSources, { name: "", url: "" }] });
  };

  const removeBulkEmbedSource = (index: number) => {
    setBulkFormData({ ...bulkFormData, embedSources: bulkFormData.embedSources.filter((_, i) => i !== index) });
  };

  const updateBulkEmbedSource = (index: number, field: "name" | "url", value: string) => {
    const updatedSources = [...bulkFormData.embedSources];
    updatedSources[index][field] = value;
    setBulkFormData({ ...bulkFormData, embedSources: updatedSources });
  };

  const resetForm = () => {
    setEditingEpisode(null);
    setFormData({
      animeId: "",
      episodeNumber: "1",
      title: "",
      season: "1",
      embedSources: [{ name: "", url: "" }],
      thumbnail: "",
    });
  };

  const resetBulkForm = () => {
    setBulkFormData({
      animeId: "",
      season: "1",
      startEpisode: "1",
      endEpisode: "12",
      titleTemplate: "Episode {number}",
      embedSources: [{ name: "Streamtape", url: "" }],
      thumbnail: "",
      useCustomTitles: false,
      customTitles: "",
    });
    setBulkPreview([]);
    setShowBulkPreview(false);
  };

  const totalPages = Math.ceil(filteredEpisodes.length / itemsPerPage);
  const paginatedEpisodes = filteredEpisodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
              <PlayCircle className="h-10 w-10 text-primary" />
              Content Engine
            </h1>
            <p className="text-muted-foreground mt-1 font-medium">
              Manage and bulk-generate episodes with multi-source redundancy
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsBulkEditOpen(true)}
              disabled={selectedEpisodes.length === 0}
              className="gap-2 rounded-xl"
            >
              <Settings2 className="h-4 w-4" />
              Bulk Edit ({selectedEpisodes.length})
            </Button>

            <Dialog
              open={isBulkDialogOpen}
              onOpenChange={(open) => {
                setIsBulkDialogOpen(open);
                if (!open) resetBulkForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2 gradient-primary rounded-xl shadow-lg shadow-primary/20">
                  <Layers className="h-4 w-4" />
                  Advanced Bulk Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">Advanced Bulk Engine</DialogTitle>
                  <DialogDescription className="font-medium">
                    Auto-generate content series with pattern-based URL replacement.
                  </DialogDescription>
                </DialogHeader>

                  {!showBulkPreview ? (
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Anime Selection</Label>
                              <Select
                                value={bulkFormData.animeId}
                                onValueChange={(val) => setBulkFormData({ ...bulkFormData, animeId: val })}
                              >
                                <SelectTrigger className="rounded-xl h-12">
                                  <SelectValue placeholder="Target Anime Series" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  {animeList.map((a) => (
                                    <SelectItem key={a.id} value={a.id.toString()}>{a.title}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start Ep</Label>
                                <Input 
                                  type="number" 
                                  className="h-11 rounded-xl font-bold"
                                  value={bulkFormData.startEpisode}
                                  onChange={e => setBulkFormData({...bulkFormData, startEpisode: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">End Ep</Label>
                                <Input 
                                  type="number" 
                                  className="h-11 rounded-xl font-bold"
                                  value={bulkFormData.endEpisode}
                                  onChange={e => setBulkFormData({...bulkFormData, endEpisode: e.target.value})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Season</Label>
                                <Input 
                                  type="number" 
                                  className="h-11 rounded-xl font-bold"
                                  value={bulkFormData.season}
                                  onChange={e => setBulkFormData({...bulkFormData, season: e.target.value})}
                                />
                              </div>
                            </div>

                            <div className="space-y-2 pt-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Naming Logic</Label>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-muted-foreground">Custom Titles</span>
                                  <Switch 
                                    checked={bulkFormData.useCustomTitles}
                                    onCheckedChange={val => setBulkFormData({...bulkFormData, useCustomTitles: val})}
                                  />
                                </div>
                              </div>
                              {bulkFormData.useCustomTitles ? (
                                <Textarea 
                                  className="rounded-xl min-h-[120px] font-mono text-xs"
                                  placeholder="Title Line 1&#10;Title Line 2&#10;..."
                                  value={bulkFormData.customTitles}
                                  onChange={e => setBulkFormData({...bulkFormData, customTitles: e.target.value})}
                                />
                              ) : (
                                <Input 
                                  className="h-12 rounded-xl"
                                  placeholder="Episode {number}"
                                  value={bulkFormData.titleTemplate}
                                  onChange={e => setBulkFormData({...bulkFormData, titleTemplate: e.target.value})}
                                />
                              )}
                            </div>

                            <div className="space-y-2 pt-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Thumbnail Logic</Label>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-muted-foreground">Custom List</span>
                                  <Switch 
                                    checked={bulkFormData.useCustomThumbnails}
                                    onCheckedChange={val => setBulkFormData({...bulkFormData, useCustomThumbnails: val})}
                                  />
                                </div>
                              </div>
                              {bulkFormData.useCustomThumbnails ? (
                                <Textarea 
                                  className="rounded-xl min-h-[100px] font-mono text-[10px]"
                                  placeholder="https://url-ep1.jpg&#10;https://url-ep2.jpg&#10;..."
                                  value={bulkFormData.customThumbnails}
                                  onChange={e => setBulkFormData({...bulkFormData, customThumbnails: e.target.value})}
                                />
                              ) : (
                                <Input 
                                  className="h-11 rounded-xl"
                                  placeholder="https://cdn.com/thumb-{number}.jpg"
                                  value={bulkFormData.thumbnail}
                                  onChange={e => setBulkFormData({...bulkFormData, thumbnail: e.target.value})}
                                />
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Video Sources</Label>
                              <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-muted-foreground">Advanced Manual Mode</span>
                                  <Switch 
                                    checked={bulkFormData.useCustomSources}
                                    onCheckedChange={val => setBulkFormData({...bulkFormData, useCustomSources: val})}
                                  />
                              </div>
                            </div>

                            {bulkFormData.useCustomSources ? (
                              <div className="space-y-2">
                                <p className="text-[10px] text-muted-foreground font-medium">
                                  Paste comma-separated links per line (e.g. url1, url2) or JSON array. 
                                  Names will be auto-set to Server 1, Server 2...
                                </p>
                                <Textarea 
                                  className="rounded-xl min-h-[200px] font-mono text-[10px]"
                                  placeholder="https://embed.com/e/abc1, https://embed.com/e/abc2&#10;https://embed.com/e/abc3, https://embed.com/e/abc4&#10;..."
                                  value={bulkFormData.customSources}
                                  onChange={e => setBulkFormData({...bulkFormData, customSources: e.target.value})}
                                />
                              </div>
                            ) : (

                              <div className="space-y-3">
                                <div className="flex justify-end">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={addBulkEmbedSource}
                                    className="h-7 text-[10px] font-black uppercase tracking-tighter"
                                  >
                                    Add Source Template +
                                  </Button>
                                </div>
                                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                  {bulkFormData.embedSources.map((s, idx) => (
                                    <div key={idx} className="p-3 rounded-2xl bg-muted/50 border border-border space-y-2 relative group">
                                      <div className="flex gap-2">
                                        <Input 
                                          className="h-9 rounded-lg text-xs font-bold w-1/3 bg-background"
                                          placeholder="Host Name"
                                          value={s.name}
                                          onChange={e => updateBulkEmbedSource(idx, "name", e.target.value)}
                                        />
                                        <Input 
                                          className="h-9 rounded-lg text-xs w-2/3 bg-background"
                                          placeholder="URL with {number} tag"
                                          value={s.url}
                                          onChange={e => updateBulkEmbedSource(idx, "url", e.target.value)}
                                        />
                                      </div>
                                      {bulkFormData.embedSources.length > 1 && (
                                        <button 
                                          type="button"
                                          onClick={() => removeBulkEmbedSource(idx)}
                                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end pt-4 gap-3 border-t">
                          <Button variant="outline" className="rounded-xl px-6" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
                          <Button className="rounded-xl px-8 gradient-primary font-bold" onClick={handleBulkPreview}>
                            Generate Preview
                          </Button>
                        </div>
                      </div>
                  ) : (
                  <div className="space-y-6 py-4">
                      <div className="rounded-2xl border border-border bg-muted/30 overflow-hidden">
                        <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
                          <span className="text-sm font-black text-foreground">Generation Preview ({bulkPreview.length} Items)</span>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowBulkPreview(false)} className="h-8 gap-2 text-xs font-bold">
                              <Edit className="h-3 w-3" /> Edit Pattern
                            </Button>
                          </div>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                          {bulkPreview.map((p, i) => (
                            <div key={i} className={cn(
                              "p-4 rounded-2xl bg-background border transition-all duration-200",
                              p.isEditing ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-border shadow-sm hover:border-primary/50"
                            )}>
                              <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border border-primary/20">
                                    {p.episodeNumber}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {p.isEditing ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Title</Label>
                                          <Input 
                                            value={p.title} 
                                            onChange={(e) => updatePreviewItem(i, "title", e.target.value)}
                                            className="h-9 rounded-lg font-bold"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thumbnail</Label>
                                          <Input 
                                            value={p.thumbnail || ""} 
                                            onChange={(e) => updatePreviewItem(i, "thumbnail", e.target.value)}
                                            className="h-9 rounded-lg font-medium"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between group/title">
                                        <div>
                                          <h4 className="text-sm font-black text-foreground">{p.title}</h4>
                                          <p className="text-[10px] font-medium text-muted-foreground truncate max-w-[300px]">{p.thumbnail || "No thumbnail"}</p>
                                        </div>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => updatePreviewItem(i, "isEditing", true)}
                                          className="h-8 w-8 p-0 opacity-0 group-hover/title:opacity-100 transition-opacity"
                                        >
                                          <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2 border-t border-border/50 pt-3">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source Streams</Label>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => addPreviewSource(i)}
                                      className="h-6 text-[9px] font-black uppercase tracking-tighter hover:bg-primary/10 hover:text-primary"
                                    >
                                      Add Source +
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    {p.sources.map((s: any, j: number) => (
                                      <div key={j} className="flex gap-2 group/source">
                                        <Input 
                                          value={s.name} 
                                          onChange={(e) => updatePreviewSource(i, j, "name", e.target.value)}
                                          className="h-8 rounded-lg text-[10px] font-black w-[100px] bg-muted/30"
                                          placeholder="Host"
                                        />
                                        <Input 
                                          value={s.url} 
                                          onChange={(e) => updatePreviewSource(i, j, "url", e.target.value)}
                                          className="h-8 rounded-lg text-[10px] flex-1 bg-muted/30"
                                          placeholder="URL"
                                        />
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => removePreviewSource(i, j)}
                                          className="h-8 w-8 p-0 text-destructive opacity-0 group-hover/source:opacity-100 transition-opacity"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {p.isEditing && (
                                  <div className="flex justify-end pt-2">
                                    <Button 
                                      size="sm" 
                                      onClick={() => updatePreviewItem(i, "isEditing", false)}
                                      className="h-8 rounded-lg font-bold text-[10px] uppercase"
                                    >
                                      Done Editing
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    {submitting && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase">
                          <span>Writing to Database...</span>
                          <span>{bulkProgress}%</span>
                        </div>
                        <Progress value={bulkProgress} className="h-2 rounded-full" />
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="outline" className="rounded-xl px-6" onClick={() => setShowBulkPreview(false)} disabled={submitting}>Back</Button>
                      <Button className="rounded-xl px-8 gradient-primary font-bold gap-2" onClick={handleBulkSubmit} disabled={submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Finalize & Create All
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            <Button 
              className="gap-2 gradient-primary rounded-xl shadow-lg shadow-primary/20"
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Quick Add
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-3xl border-border bg-card/50 backdrop-blur-xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Ep</p>
                <h3 className="text-2xl font-black text-foreground">{episodes.length}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border bg-card/50 backdrop-blur-xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Active Series</p>
                <h3 className="text-2xl font-black text-foreground">{new Set(episodes.map(e => e.animeId)).size}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border bg-card/50 backdrop-blur-xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
                <ExternalLink className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Redundancy</p>
                <h3 className="text-2xl font-black text-foreground">
                  {(episodes.reduce((sum, e) => sum + e.embedSources.length, 0) / (episodes.length || 1)).toFixed(1)}x
                </h3>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border bg-card/50 backdrop-blur-xl">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Weekly Growth</p>
                <h3 className="text-2xl font-black text-foreground">+24</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and List */}
        <Card className="rounded-3xl border-border bg-card/50 backdrop-blur-xl overflow-hidden">
          <CardHeader className="p-6 border-b border-border/50">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by title, episode, or anime..." 
                  className="pl-11 h-12 rounded-2xl bg-muted/20 border-border/50"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Select value={animeFilter} onValueChange={setAnimeFilter}>
                  <SelectTrigger className="h-12 rounded-2xl md:w-[240px] bg-muted/20 border-border/50">
                    <SelectValue placeholder="All Series" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">All Anime Series</SelectItem>
                    {animeList.map(a => (
                      <SelectItem key={a.id} value={a.id.toString()}>{a.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" className="h-12 w-12 rounded-2xl p-0" onClick={fetchData}>
                  <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-12 text-center">
                      <Checkbox 
                        checked={selectedEpisodes.length === paginatedEpisodes.length && paginatedEpisodes.length > 0}
                        onCheckedChange={toggleAllEpisodes}
                      />
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Source Anime</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Episode</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Title</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Sources</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-64 text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : paginatedEpisodes.length > 0 ? (
                    paginatedEpisodes.map((ep) => (
                      <TableRow key={ep.id} className="group border-border/50 hover:bg-primary/5 transition-colors">
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={selectedEpisodes.includes(ep.id)}
                            onCheckedChange={() => toggleEpisodeSelection(ep.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-black text-sm text-foreground">{getAnimeName(ep.animeId)}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Season {ep.season}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center font-black text-sm border border-border group-hover:border-primary/30 transition-colors">
                            {ep.episodeNumber}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-sm max-w-[200px] truncate">{ep.title}</TableCell>
                        <TableCell>
                          <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                            {ep.embedSources.map((s, i) => (
                              <Badge key={i} variant="secondary" className="text-[9px] h-5 px-1.5 font-bold uppercase border-white/5">
                                {s.name}
                              </Badge>
                            ))}
                            {ep.thumbnail && (
                              <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-[8px] font-bold border border-white/5" title="Thumbnail present">
                                <Eye className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                              <DropdownMenuItem className="gap-2 font-bold" onClick={() => handleEdit(ep)}>
                                <Edit className="h-4 w-4" /> Edit Content
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 font-bold" onClick={() => window.open(`/anime/${ep.id}/watch/${ep.episodeNumber}`, '_blank')}>
                                <PlayCircle className="h-4 w-4" /> View Live
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 font-bold text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleDelete(ep.id)}>
                                <Trash2 className="h-4 w-4" /> Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center opacity-20">
                          <Video className="h-16 w-16 mb-2" />
                          <p className="font-black text-xl">Empty Vault</p>
                          <p className="text-xs">No episodes found for this filter</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-border/50 flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl h-9 w-9 p-0"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl h-9 w-9 p-0"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bulk Edit Dialog */}
      <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Bulk Update Logic</DialogTitle>
            <DialogDescription className="font-medium">Apply changes to {selectedEpisodes.length} selected items.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Override Season</Label>
              <Input 
                type="number" 
                placeholder="New Season #"
                className="h-12 rounded-xl"
                value={bulkEditData.season}
                onChange={e => setBulkEditData({...bulkEditData, season: e.target.value})}
              />
            </div>
            <Separator className="my-2" />
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Inject New Source (Append)</Label>
              <Input 
                placeholder="Source Name (e.g. Mirror 2)"
                className="h-11 rounded-xl"
                value={bulkEditData.sourceName}
                onChange={e => setBulkEditData({...bulkEditData, sourceName: e.target.value})}
              />
              <Input 
                placeholder="URL with {number} tag"
                className="h-11 rounded-xl"
                value={bulkEditData.sourceUrlTemplate}
                onChange={e => setBulkEditData({...bulkEditData, sourceUrlTemplate: e.target.value})}
              />
              <p className="text-[10px] text-muted-foreground italic">Useful for adding a secondary server to multiple existing episodes.</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setIsBulkEditOpen(false)}>Cancel</Button>
            <Button className="rounded-xl gradient-primary font-bold" onClick={handleBulkUpdate} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Run Bulk Operation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Add Dialog (Simplified) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[2rem] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{editingEpisode ? "Refine Content" : "Quick Inject"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Parent Series</Label>
              <Select value={formData.animeId} onValueChange={val => setFormData({...formData, animeId: val})}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select Anime" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {animeList.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ep #</Label>
                <Input type="number" className="rounded-xl h-11" value={formData.episodeNumber} onChange={e => setFormData({...formData, episodeNumber: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Season #</Label>
                <Input type="number" className="rounded-xl h-11" value={formData.season} onChange={e => setFormData({...formData, season: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Direct Title</Label>
              <Input className="rounded-xl h-11" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Redundant Video Rails</Label>
                <Button variant="ghost" size="sm" type="button" onClick={addEmbedSource} className="h-6 text-[10px] font-black uppercase">Add +</Button>
              </div>
              {formData.embedSources.map((s, idx) => (
                <div key={idx} className="flex gap-2 p-3 rounded-2xl bg-muted/50 border border-border">
                  <Input placeholder="Label" className="h-9 rounded-lg w-1/4" value={s.name} onChange={e => updateEmbedSource(idx, "name", e.target.value)} />
                  <Input placeholder="Embed URL" className="h-9 rounded-lg w-3/4" value={s.url} onChange={e => updateEmbedSource(idx, "url", e.target.value)} />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Thumbnail (Optional)</Label>
              <Input className="rounded-xl h-11" value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" type="button" className="rounded-xl" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button className="rounded-xl gradient-primary font-bold px-8" type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingEpisode ? "Update" : "Inject Episode")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
