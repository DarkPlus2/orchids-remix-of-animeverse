"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Trash2, User, Film, Clock, AlertTriangle, Loader2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAuthToken, getAdminData } from "@/lib/auth";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  isSpoiler: boolean;
  isPinned: boolean;
  likes: number;
  dislikes: number;
  user: {
    username: string;
    name: string;
  } | null;
  anime: {
    title: string;
    slug: string;
  } | null;
  episodeNumber: number | null;
}

export default function CommentsModerationPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const adminData = getAdminData();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch("/api/admin/comments", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        toast.error("Failed to load comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        setComments(comments.filter(c => c.id !== id));
        toast.success("Comment deleted successfully");
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Network error");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredComments = comments.filter(c => 
    c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.anime?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground">
              <MessageCircle className="h-8 w-8 text-primary" />
              Comments Moderation
            </h1>
            <p className="text-muted-foreground mt-1">Review and manage user comments across the platform</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchComments} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search comments, users or anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1 text-xs">
              {filteredComments.length} Comments Found
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground">No comments found</h3>
            <p className="text-muted-foreground">Adjust your search or check back later</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredComments.map((comment) => (
              <Card key={comment.id} className="overflow-hidden border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* User & Info Side */}
                    <div className="w-full md:w-64 p-4 bg-muted/30 border-b md:border-b-0 md:border-r border-border space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{comment.user?.name || "Deleted User"}</p>
                          <p className="text-[10px] text-muted-foreground truncate">@{comment.user?.username || "deleted"}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Film className="h-3 w-3" />
                          <span className="truncate">{comment.anime?.title || "Unknown Anime"}</span>
                        </div>
                        {comment.episodeNumber && (
                          <Badge variant="outline" className="text-[9px] h-4">
                            Episode {comment.episodeNumber}
                          </Badge>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(comment.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        {comment.isSpoiler && (
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0">SPOILER</Badge>
                        )}
                        {comment.isPinned && (
                          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 text-[9px] px-1.5 py-0">PINNED</Badge>
                        )}
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <p className="text-sm text-foreground leading-relaxed italic whitespace-pre-wrap">
                        "{comment.content}"
                      </p>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="text-green-500 font-bold">{comment.likes}</span> Likes
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="text-red-500 font-bold">{comment.dislikes}</span> Dislikes
                          </span>
                        </div>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently remove the comment from the platform.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(comment.id)}
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
