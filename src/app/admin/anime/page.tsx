"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Edit, Trash2, Search, Filter, Film, Star, Eye,
  MoreHorizontal, Download, Upload, RefreshCw, Loader2,
  ChevronLeft, ChevronRight, ArrowUpDown, TrendingUp, Sparkles,
  FileJson, FileSpreadsheet, Image, Link2, Copy, Check, X,
  Grid3X3, List, LayoutGrid, SortAsc, SortDesc, Calendar, Clock,
  Tag, Layers, Package, Archive, AlertCircle, CheckCircle, XCircle,
  Settings, Wand2, Zap, Globe, Play, Pause, BarChart3, Pin
} from "lucide-react";
import { toast } from "sonner";
import { Anime } from "@/lib/types/anime";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const years = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());

type ViewMode = "table" | "grid" | "compact";
type SortField = "title" | "rating" | "releaseYear" | "totalEpisodes" | "createdAt";
type SortOrder = "asc" | "desc";

export default function AnimeManagementPage() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedAnime, setSelectedAnime] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [importData, setImportData] = useState("");
  const [bulkAction, setBulkAction] = useState("");
  const itemsPerPage = viewMode === "grid" ? 12 : 10;

  const [formData, setFormData] = useState({
    title: "",
    synopsis: "",
    coverImage: "",
    bannerImage: "",
    rating: "8.0",
    genres: "",
    status: "ongoing" as "ongoing" | "completed",
      releaseYear: new Date().getFullYear().toString(),
      totalEpisodes: "12",
      type: "Series" as "Movie" | "Series" | "OVA" | "Special",
      trending: false,
      mostWatched: false,
      pinned: false,
      studios: "",
      producers: "",
      duration: "24",
      seasonCount: "1",
    });

    const [anilistQuery, setAnilistQuery] = useState("");
    const [fetchingAnilist, setFetchingAnilist] = useState(false);

    const fetchFromAniList = async () => {
      const queryToUse = anilistQuery || formData.title;
      if (!queryToUse.trim()) {
        toast.error("Please enter a title or AniList search query");
        return;
      }

      setFetchingAnilist(true);
      try {
        const query = `
          query ($search: String) {
            Media (search: $search, type: ANIME) {
              title {
                romaji
                english
                native
              }
              description
              coverImage {
                extraLarge
              }
              bannerImage
              averageScore
              genres
              status
              seasonYear
              episodes
              format
              duration
              studios {
                nodes {
                  name
                  isAnimationStudio
                }
              }
            }
          }
        `;

        const response = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            query,
            variables: { search: queryToUse },
          }),
        });

        const result = await response.json();
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        const media = result.data.Media;
        if (!media) {
          toast.error("No anime found on AniList");
          return;
        }

        const studios = media.studios.nodes.filter((s: any) => s.isAnimationStudio).map((s: any) => s.name);
        const producers = media.studios.nodes.filter((s: any) => !s.isAnimationStudio).map((s: any) => s.name);

        setFormData({
          ...formData,
          title: media.title.english || media.title.romaji || media.title.native,
          synopsis: media.description?.replace(/<br>/g, "\n").replace(/<i>/g, "").replace(/<\/i>/g, "").replace(/<b>/g, "").replace(/<\/b>/g, "").replace(/<[^>]*>?/gm, "") || "",
          coverImage: media.coverImage.extraLarge,
          bannerImage: media.bannerImage || media.coverImage.extraLarge,
          rating: (media.averageScore / 10).toString(),
          genres: media.genres.join(", "),
          status: media.status === "RELEASING" ? "ongoing" : "completed",
          releaseYear: media.seasonYear?.toString() || formData.releaseYear,
          totalEpisodes: media.episodes?.toString() || "0",
          type: media.format === "MOVIE" ? "Movie" : "Series",
          duration: media.duration?.toString() || "24",
          studios: studios.join(", "),
          producers: producers.join(", "),
        });

        toast.success("Imported details from AniList");
      } catch (error) {
        console.error("AniList fetch error:", error);
        toast.error("Failed to fetch from AniList");
      } finally {
        setFetchingAnilist(false);
      }
    };

  const [stats, setStats] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    trending: 0,
    mostWatched: 0,
    pinned: 0,
    avgRating: 0,
  });

  useEffect(() => {
    fetchAnime();
  }, []);

  useEffect(() => {
    let filtered = animeList;

    // Tab filter
    if (activeTab === "ongoing") {
      filtered = filtered.filter((a) => a.status === "ongoing");
    } else if (activeTab === "completed") {
      filtered = filtered.filter((a) => a.status === "completed");
    } else if (activeTab === "trending") {
      filtered = filtered.filter((a) => a.trending);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.genres.some((g) => g.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "trending") {
        filtered = filtered.filter((a) => a.trending);
      } else if (statusFilter === "mostWatched") {
        filtered = filtered.filter((a) => a.mostWatched);
      } else if (statusFilter === "pinned") {
        filtered = filtered.filter((a) => a.pinned);
      } else {
        filtered = filtered.filter((a) => a.status === statusFilter);
      }
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }

    // Year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter((a) => a.releaseYear.toString() === yearFilter);
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "rating":
          aVal = a.rating;
          bVal = b.rating;
          break;
        case "releaseYear":
          aVal = a.releaseYear;
          bVal = b.releaseYear;
          break;
        case "totalEpisodes":
          aVal = a.totalEpisodes;
          bVal = b.totalEpisodes;
          break;
        default:
          aVal = new Date((a as any).createdAt || 0).getTime();
          bVal = new Date((b as any).createdAt || 0).getTime();
      }
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredAnime(filtered);
    setCurrentPage(1);
  }, [animeList, searchQuery, statusFilter, typeFilter, yearFilter, sortField, sortOrder, activeTab]);

  useEffect(() => {
    if (selectAll) {
      setSelectedAnime(new Set(paginatedAnime.map((a) => a.id)));
    } else if (selectedAnime.size === paginatedAnime.length && paginatedAnime.length > 0) {
      // Keep selection if manually selected all
    }
  }, [selectAll]);

  const fetchAnime = async () => {
    try {
      const res = await fetch("/api/anime");
      const data = await res.json();
      setAnimeList(data);
      setFilteredAnime(data);

      // Calculate stats
      const ongoing = data.filter((a: Anime) => a.status === "ongoing").length;
      const completed = data.filter((a: Anime) => a.status === "completed").length;
      const trending = data.filter((a: Anime) => a.trending).length;
      const mostWatched = data.filter((a: Anime) => a.mostWatched).length;
      const pinned = data.filter((a: Anime) => a.pinned).length;
      const avgRating = data.length > 0 
        ? data.reduce((sum: number, a: Anime) => sum + a.rating, 0) / data.length 
        : 0;

      setStats({
        total: data.length,
        ongoing,
        completed,
        trending,
        mostWatched,
        pinned,
        avgRating: Math.round(avgRating * 10) / 10,
      });
    } catch (error) {
      console.error("Error fetching anime:", error);
      toast.error("Failed to load anime");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Parse genres from comma-separated string
    const genresArray = formData.genres
      .split(",")
      .map(g => g.trim())
      .filter(g => g.length > 0);

    if (genresArray.length === 0) {
      toast.error("Please enter at least one genre");
      setSubmitting(false);
      return;
    }

    const animeData = {
      ...formData,
      rating: parseFloat(formData.rating),
      releaseYear: parseInt(formData.releaseYear),
      totalEpisodes: parseInt(formData.totalEpisodes),
      genres: genresArray,
      studios: formData.studios.split(",").map(s => s.trim()).filter(Boolean),
      producers: formData.producers.split(",").map(p => p.trim()).filter(Boolean),
      duration: parseInt(formData.duration),
      seasonCount: parseInt(formData.seasonCount),
      episodes: [],
    };

    try {
      if (editingAnime) {
        const res = await fetch(`/api/anime/${editingAnime.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(animeData),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("Anime updated successfully");
      } else {
        const res = await fetch("/api/anime", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(animeData),
        });
        if (!res.ok) throw new Error("Failed to create");
        toast.success("Anime created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchAnime();
    } catch (error) {
      console.error("Error saving anime:", error);
      toast.error("Failed to save anime");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (anime: Anime) => {
    setEditingAnime(anime);
    setFormData({
      title: anime.title,
      synopsis: anime.synopsis,
      coverImage: anime.coverImage,
      bannerImage: anime.bannerImage,
      rating: anime.rating.toString(),
      genres: anime.genres.join(", "),
      status: anime.status,
      releaseYear: anime.releaseYear.toString(),
      totalEpisodes: anime.totalEpisodes.toString(),
      type: anime.type,
      trending: anime.trending || false,
      mostWatched: anime.mostWatched || false,
      pinned: anime.pinned || false,
      studios: (anime.studios || []).join(", "),
      producers: (anime.producers || []).join(", "),
      duration: (anime.duration || 24).toString(),
      seasonCount: (anime.seasonCount || 1).toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (slug: string) => {
    try {
      const res = await fetch(`/api/anime/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Anime deleted successfully");
      fetchAnime();
    } catch (error) {
      console.error("Error deleting anime:", error);
      toast.error("Failed to delete anime");
    }
  };

  const handleToggleTrending = async (anime: Anime) => {
    try {
      const res = await fetch(`/api/anime/${anime.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...anime, trending: !anime.trending }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(`${anime.title} ${!anime.trending ? "added to" : "removed from"} trending`);
      fetchAnime();
    } catch (error) {
      toast.error("Failed to update anime");
    }
  };

  const handleToggleMostWatched = async (anime: Anime) => {
    try {
      const res = await fetch(`/api/anime/${anime.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...anime, mostWatched: !anime.mostWatched }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(`${anime.title} ${!anime.mostWatched ? "added to" : "removed from"} most watched`);
      fetchAnime();
    } catch (error) {
      toast.error("Failed to update anime");
    }
  };

  const handleTogglePinned = async (anime: Anime) => {
    try {
      const res = await fetch(`/api/anime/${anime.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...anime, pinned: !anime.pinned }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(`${anime.title} ${!anime.pinned ? "pinned" : "unpinned"}`);
      fetchAnime();
    } catch (error) {
      toast.error("Failed to update anime");
    }
  };

  const handleBulkAction = async () => {
    if (selectedAnime.size === 0) {
      toast.error("No anime selected");
      return;
    }

    setSubmitting(true);
    const selectedIds = Array.from(selectedAnime);

    try {
      for (const id of selectedIds) {
        const anime = animeList.find((a) => a.id === id);
        if (!anime) continue;

        switch (bulkAction) {
          case "trending":
            await fetch(`/api/anime/${anime.slug}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...anime, trending: true }),
            });
            break;
          case "untrending":
            await fetch(`/api/anime/${anime.slug}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...anime, trending: false }),
            });
            break;
          case "mostWatched":
            await fetch(`/api/anime/${anime.slug}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...anime, mostWatched: true }),
            });
            break;
          case "unmostWatched":
            await fetch(`/api/anime/${anime.slug}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...anime, mostWatched: false }),
            });
            break;
          case "pinned":
            await fetch(`/api/anime/${anime.slug}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...anime, pinned: true }),
            });
            break;
          case "unpinned":
            await fetch(`/api/anime/${anime.slug}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...anime, pinned: false }),
            });
            break;
          case "delete":
            await fetch(`/api/anime/${anime.slug}`, { method: "DELETE" });
            break;
        }
      }

      toast.success(`Bulk action completed for ${selectedIds.length} anime`);
      setSelectedAnime(new Set());
      setSelectAll(false);
      setIsBulkDialogOpen(false);
      fetchAnime();
    } catch (error) {
      toast.error("Failed to complete bulk action");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = (format: "json" | "csv") => {
    const dataToExport = selectedAnime.size > 0 
      ? animeList.filter((a) => selectedAnime.has(a.id))
      : animeList;

    if (format === "json") {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `anime-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      toast.success(`Exported ${dataToExport.length} anime as JSON`);
    } else {
      const headers = ["title", "status", "rating", "releaseYear", "genres", "totalEpisodes", "type"];
      const csvContent = [
        headers.join(","),
        ...dataToExport.map((a) => 
          headers.map((h) => {
            const val = (a as any)[h];
            if (Array.isArray(val)) return `"${val.join(";")}"`;
            if (typeof val === "string" && val.includes(",")) return `"${val}"`;
            return val;
          }).join(",")
        ),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `anime-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      toast.success(`Exported ${dataToExport.length} anime as CSV`);
    }
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importData);
      const animeArray = Array.isArray(data) ? data : [data];
      
      let successCount = 0;
      for (const anime of animeArray) {
        const res = await fetch("/api/anime", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(anime),
        });
        if (res.ok) successCount++;
      }

      toast.success(`Imported ${successCount} of ${animeArray.length} anime`);
      setIsImportDialogOpen(false);
      setImportData("");
      fetchAnime();
    } catch (error) {
      toast.error("Invalid JSON format");
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedAnime);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAnime(newSelected);
    setSelectAll(newSelected.size === paginatedAnime.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedAnime(new Set());
    } else {
      setSelectedAnime(new Set(paginatedAnime.map((a) => a.id)));
    }
    setSelectAll(!selectAll);
  };

  const resetForm = () => {
    setEditingAnime(null);
    setFormData({
      title: "",
      synopsis: "",
      coverImage: "",
      bannerImage: "",
      rating: "8.0",
      genres: "",
      status: "ongoing",
      releaseYear: new Date().getFullYear().toString(),
      totalEpisodes: "12",
      type: "Series",
      trending: false,
      mostWatched: false,
      pinned: false,
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredAnime.length / itemsPerPage);
  const paginatedAnime = filteredAnime.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    return sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Film className="h-8 w-8 text-primary" />
              Anime Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your anime library ({stats.total} total)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Import/Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  <FileJson className="h-4 w-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Anime</DialogTitle>
                  <DialogDescription>Paste JSON data to import anime entries</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder='[{"title": "Anime Name", "synopsis": "...", ...}]'
                    rows={10}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleImport} disabled={!importData.trim()}>
                      Import
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2 gradient-primary">
                  <Plus className="h-4 w-4" />
                  Add Anime
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAnime ? "Edit Anime" : "Add New Anime"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingAnime
                      ? "Update anime information"
                      : "Fill in the details to add a new anime"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder="e.g., Attack on Titan"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="anilist">AniList Fetch (Title or Query)</Label>
                        <div className="flex gap-2">
                          <Input
                            id="anilist"
                            value={anilistQuery}
                            onChange={(e) => setAnilistQuery(e.target.value)}
                            placeholder="Search AniList..."
                          />
                          <Button 
                            type="button" 
                            variant="secondary"
                            onClick={fetchFromAniList}
                            disabled={fetchingAnilist}
                            className="shrink-0"
                          >
                            {fetchingAnilist ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Wand2 className="h-4 w-4 mr-2" />
                            )}
                            Fetch
                          </Button>
                        </div>
                      </div>
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="synopsis">Synopsis *</Label>
                    <Textarea
                      id="synopsis"
                      value={formData.synopsis}
                      onChange={(e) =>
                        setFormData({ ...formData, synopsis: e.target.value })
                      }
                      rows={4}
                      placeholder="Brief description of the anime..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coverImage">Cover Image URL *</Label>
                      <Input
                        id="coverImage"
                        type="url"
                        value={formData.coverImage}
                        onChange={(e) =>
                          setFormData({ ...formData, coverImage: e.target.value })
                        }
                        placeholder="https://..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bannerImage">Banner Image URL *</Label>
                      <Input
                        id="bannerImage"
                        type="url"
                        value={formData.bannerImage}
                        onChange={(e) =>
                          setFormData({ ...formData, bannerImage: e.target.value })
                        }
                        placeholder="https://..."
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rating">Rating (0-10)</Label>
                      <Input
                        id="rating"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={formData.rating}
                        onChange={(e) =>
                          setFormData({ ...formData, rating: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "ongoing" | "completed") =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="releaseYear">Release Year</Label>
                      <Select
                        value={formData.releaseYear}
                        onValueChange={(value) =>
                          setFormData({ ...formData, releaseYear: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalEpisodes">Total Episodes</Label>
                      <Input
                        id="totalEpisodes"
                        type="number"
                        value={formData.totalEpisodes}
                        onChange={(e) =>
                          setFormData({ ...formData, totalEpisodes: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "Movie" | "Series" | "OVA" | "Special") =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Series">Series</SelectItem>
                        <SelectItem value="Movie">Movie</SelectItem>
                        <SelectItem value="OVA">OVA</SelectItem>
                        <SelectItem value="Special">Special</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="studios">Studios (comma-separated)</Label>
                        <Input
                          id="studios"
                          value={formData.studios}
                          onChange={(e) =>
                            setFormData({ ...formData, studios: e.target.value })
                          }
                          placeholder="e.g., MAPPA, Wit Studio"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="producers">Producers (comma-separated)</Label>
                        <Input
                          id="producers"
                          value={formData.producers}
                          onChange={(e) =>
                            setFormData({ ...formData, producers: e.target.value })
                          }
                          placeholder="e.g., Aniplex, TV Tokyo"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Episode Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({ ...formData, duration: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seasonCount">Total Seasons</Label>
                        <Input
                          id="seasonCount"
                          type="number"
                          value={formData.seasonCount}
                          onChange={(e) =>
                            setFormData({ ...formData, seasonCount: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="genres">Genres * (comma-separated)</Label>
                    <Input
                      id="genres"
                      value={formData.genres}
                      onChange={(e) =>
                        setFormData({ ...formData, genres: e.target.value })
                      }
                      placeholder="e.g., Action, Adventure, Fantasy"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter genres separated by commas
                    </p>
                  </div>

                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="trending"
                        checked={formData.trending}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, trending: checked as boolean })
                        }
                      />
                      <Label htmlFor="trending" className="cursor-pointer flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        Trending
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="mostWatched"
                        checked={formData.mostWatched}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, mostWatched: checked as boolean })
                        }
                      />
                      <Label htmlFor="mostWatched" className="cursor-pointer flex items-center gap-1.5">
                        <Eye className="h-4 w-4 text-cyan-500" />
                        Most Watched
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="pinned"
                        checked={formData.pinned}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, pinned: checked as boolean })
                        }
                      />
                      <Label htmlFor="pinned" className="cursor-pointer flex items-center gap-1.5">
                        <Pin className="h-4 w-4 text-purple-500" />
                        Pinned
                      </Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="gradient-primary">
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : editingAnime ? (
                        "Update Anime"
                      ) : (
                        "Add Anime"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Film className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Play className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.ongoing}</p>
                  <p className="text-xs text-muted-foreground">Ongoing</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.trending}</p>
                  <p className="text-xs text-muted-foreground">Trending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Eye className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.mostWatched}</p>
                  <p className="text-xs text-muted-foreground">Most Watched</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Pin className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pinned}</p>
                  <p className="text-xs text-muted-foreground">Pinned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Star className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgRating}</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 h-auto p-1 bg-muted/50">
            <TabsTrigger value="all" className="gap-2 data-[state=active]:bg-background">
              All
              <Badge variant="secondary" className="ml-1">{stats.total}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="gap-2 data-[state=active]:bg-background">
              Ongoing
              <Badge variant="secondary" className="ml-1">{stats.ongoing}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2 data-[state=active]:bg-background">
              Completed
              <Badge variant="secondary" className="ml-1">{stats.completed}</Badge>
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2 data-[state=active]:bg-background">
              Trending
              <Badge variant="secondary" className="ml-1">{stats.trending}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters & Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search anime by title, genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <Film className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Series">Series</SelectItem>
                    <SelectItem value="Movie">Movie</SelectItem>
                    <SelectItem value="OVA">OVA</SelectItem>
                    <SelectItem value="Special">Special</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-32">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years.slice(0, 15).map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <Button
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("table")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "compact" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-none"
                    onClick={() => setViewMode("compact")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="outline" onClick={fetchAnime} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedAnime.size > 0 && (
              <div className="flex items-center gap-4 mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Badge variant="secondary">{selectedAnime.size} selected</Badge>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => { setBulkAction("trending"); setIsBulkDialogOpen(true); }}>
                    <TrendingUp className="h-4 w-4 mr-1" /> Trend
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setBulkAction("mostWatched"); setIsBulkDialogOpen(true); }}>
                    <Eye className="h-4 w-4 mr-1" /> Most Watched
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setBulkAction("pinned"); setIsBulkDialogOpen(true); }}>
                    <Pin className="h-4 w-4 mr-1" /> Pin
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => { setBulkAction("delete"); setIsBulkDialogOpen(true); }}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
                <Button size="sm" variant="ghost" onClick={() => { setSelectedAnime(new Set()); setSelectAll(false); }}>
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Action Dialog */}
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Bulk Action</DialogTitle>
              <DialogDescription>
                Are you sure you want to {bulkAction} {selectedAnime.size} anime?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>Cancel</Button>
              <Button 
                variant={bulkAction === "delete" ? "destructive" : "default"}
                onClick={handleBulkAction}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Anime Display */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : viewMode === "grid" ? (
              // Grid View
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {paginatedAnime.map((anime) => (
                    <div
                      key={anime.id}
                      className={`group relative rounded-xl overflow-hidden border transition-all hover:border-primary/50 ${
                        selectedAnime.has(anime.id) ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          checked={selectedAnime.has(anime.id)}
                          onCheckedChange={() => handleToggleSelect(anime.id)}
                          className="bg-background/80"
                        />
                      </div>
                      <img
                        src={anime.coverImage}
                        alt={anime.title}
                        className="w-full aspect-[2/3] object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-sm font-medium text-white truncate">{anime.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={anime.status === "ongoing" ? "default" : "secondary"} className="text-[10px]">
                            {anime.status}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">{anime.type}</Badge>
                          <span className="text-xs text-white/80 flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {anime.rating}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          <Button size="sm" variant="secondary" className="h-7 px-2" onClick={() => handleEdit(anime)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="secondary" className="h-7 px-2" onClick={() => handleToggleTrending(anime)}>
                            <TrendingUp className={`h-3 w-3 ${anime.trending ? "text-orange-500" : ""}`} />
                          </Button>
                          <Button size="sm" variant="secondary" className="h-7 px-2" onClick={() => handleToggleMostWatched(anime)}>
                            <Eye className={`h-3 w-3 ${anime.mostWatched ? "text-cyan-500" : ""}`} />
                          </Button>
                          <Button size="sm" variant="secondary" className="h-7 px-2" onClick={() => handleTogglePinned(anime)}>
                            <Pin className={`h-3 w-3 ${anime.pinned ? "text-purple-500" : ""}`} />
                          </Button>
                        </div>
                      </div>
                      {(anime.trending || anime.mostWatched || anime.pinned) && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          {anime.trending && <TrendingUp className="h-4 w-4 text-orange-500" />}
                          {anime.mostWatched && <Eye className="h-4 w-4 text-cyan-500" />}
                          {anime.pinned && <Pin className="h-4 w-4 text-purple-500" />}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : viewMode === "compact" ? (
              // Compact View
              <div className="p-4 space-y-2">
                {paginatedAnime.map((anime) => (
                  <div
                    key={anime.id}
                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors ${
                      selectedAnime.has(anime.id) ? "bg-primary/5 ring-1 ring-primary" : ""
                    }`}
                  >
                    <Checkbox
                      checked={selectedAnime.has(anime.id)}
                      onCheckedChange={() => handleToggleSelect(anime.id)}
                    />
                    <img
                      src={anime.coverImage}
                      alt={anime.title}
                      className="w-10 h-14 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{anime.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{anime.genres.slice(0, 3).join(", ")}</p>
                    </div>
                    <Badge variant={anime.status === "ongoing" ? "default" : "secondary"}>
                      {anime.status}
                    </Badge>
                    <Badge variant="outline">{anime.type}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {anime.rating}
                    </div>
                    <div className="flex gap-1">
                      {anime.trending && <TrendingUp className="h-4 w-4 text-orange-500" />}
                      {anime.mostWatched && <Eye className="h-4 w-4 text-cyan-500" />}
                      {anime.pinned && <Pin className="h-4 w-4 text-purple-500" />}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(anime)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleTrending(anime)}>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          {anime.trending ? "Remove Trending" : "Set Trending"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleMostWatched(anime)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {anime.mostWatched ? "Remove Most Watched" : "Set Most Watched"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePinned(anime)}>
                          <Pin className="h-4 w-4 mr-2" />
                          {anime.pinned ? "Unpin" : "Pin"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(anime.slug)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            ) : (
              // Table View
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                        <div className="flex items-center gap-2">
                          Anime <SortIcon field="title" />
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("rating")}>
                        <div className="flex items-center gap-2">
                          Rating <SortIcon field="rating" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("totalEpisodes")}>
                        <div className="flex items-center gap-2">
                          Episodes <SortIcon field="totalEpisodes" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("releaseYear")}>
                        <div className="flex items-center gap-2">
                          Year <SortIcon field="releaseYear" />
                        </div>
                      </TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAnime.length > 0 ? (
                      paginatedAnime.map((anime) => (
                        <TableRow key={anime.id} className={selectedAnime.has(anime.id) ? "bg-primary/5" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={selectedAnime.has(anime.id)}
                              onCheckedChange={() => handleToggleSelect(anime.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={anime.coverImage}
                                alt={anime.title}
                                className="w-10 h-14 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium">{anime.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {anime.genres.slice(0, 2).join(", ")}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={anime.status === "ongoing" ? "default" : "secondary"}
                            >
                              {anime.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{anime.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              {anime.rating}
                            </div>
                          </TableCell>
                          <TableCell>{anime.totalEpisodes}</TableCell>
                          <TableCell>{anime.releaseYear}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {anime.trending && (
                                <Badge variant="outline" className="text-orange-500 border-orange-500/50">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  Trending
                                </Badge>
                              )}
                              {anime.mostWatched && (
                                <Badge variant="outline" className="text-cyan-500 border-cyan-500/50">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Most Watched
                                </Badge>
                              )}
                              {anime.pinned && (
                                <Badge variant="outline" className="text-purple-500 border-purple-500/50">
                                  <Pin className="h-3 w-3 mr-1" />
                                  Pinned
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(anime)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleTrending(anime)}>
                                  <TrendingUp className="h-4 w-4 mr-2" />
                                  {anime.trending ? "Remove Trending" : "Set Trending"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleMostWatched(anime)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  {anime.mostWatched ? "Remove Most Watched" : "Set Most Watched"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleTogglePinned(anime)}>
                                  <Pin className="h-4 w-4 mr-2" />
                                  {anime.pinned ? "Unpin" : "Pin"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(anime.slug)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12">
                          <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No anime found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {filteredAnime.length > itemsPerPage && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(currentPage * itemsPerPage, filteredAnime.length)} of{" "}
                      {filteredAnime.length} results
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}