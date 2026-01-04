"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ChevronDown, SlidersHorizontal, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Comment {
  id: number;
  userId: number;
  animeId: number;
  content: string;
  parentCommentId: number | null;
  likes: number;
  dislikes: number;
  isPinned: boolean;
  isSpoiler: boolean;
  createdAt: string;
  user: {
    id: number;
    username: string;
    name: string;
    profilePicture: string | null;
    role?: string;
  };
  replies: Comment[];
  isLiked?: boolean;
  isDisliked?: boolean;
}

interface CommentSectionProps {
  animeId: string;
  episodeNumber?: number;
}

export function CommentSection({ animeId, episodeNumber }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  const [displayCount, setDisplayCount] = useState(10);

  const fetchComments = async () => {
    try {
      let url = `/api/comments?animeId=${animeId}&sort=${sortBy}`;
      if (episodeNumber) {
        url += `&episodeNumber=${episodeNumber}`;
      }
      
      let token = null;
      if (typeof window !== "undefined") {
        try {
          token = localStorage.getItem("user_auth_token");
        } catch (e) {
          console.warn("localStorage access denied");
        }
      }

      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [animeId, sortBy, episodeNumber]);

  const handleCommentSubmit = async (content: string, isSpoiler?: boolean) => {
    if (!isAuthenticated) {
      toast.error("Please login to comment");
      return;
    }

    try {
      let token = null;
      if (typeof window !== "undefined") {
        try {
          token = localStorage.getItem("user_auth_token");
        } catch (e) {
          console.warn("localStorage access denied");
        }
      }

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          animeId: parseInt(animeId),
          episodeNumber: episodeNumber || null,
          content,
          parentCommentId: null,
          isSpoiler: isSpoiler || false,
        }),
      });

      if (res.ok) {
        toast.success("Comment posted!");
        fetchComments();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to post comment");
      }
    } catch (error) {
      toast.error("Failed to post comment");
    }
  };

  const handleReply = async (parentCommentId: number, content: string, isSpoiler?: boolean) => {
    if (!isAuthenticated) {
      toast.error("Please login to reply");
      return;
    }

    try {
      let token = null;
      if (typeof window !== "undefined") {
        try {
          token = localStorage.getItem("user_auth_token");
        } catch (e) {
          console.warn("localStorage access denied");
        }
      }

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          animeId: parseInt(animeId),
          episodeNumber: episodeNumber || null,
          content,
          parentCommentId,
          isSpoiler: isSpoiler || false,
        }),
      });

      if (res.ok) {
        toast.success("Reply posted!");
        fetchComments();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to post reply");
      }
    } catch (error) {
      toast.error("Failed to post reply");
    }
  };

  const handleLike = async (commentId: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to like comments");
      return;
    }

    try {
      let token = null;
      if (typeof window !== "undefined") {
        try {
          token = localStorage.getItem("user_auth_token");
        } catch (e) {
          console.warn("localStorage access denied");
        }
      }

      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDislike = async (commentId: number) => {
    if (!isAuthenticated) {
      toast.error("Please login to dislike comments");
      return;
    }

    try {
      let token = null;
      if (typeof window !== "undefined") {
        try {
          token = localStorage.getItem("user_auth_token");
        } catch (e) {
          console.warn("localStorage access denied");
        }
      }

      const res = await fetch(`/api/comments/${commentId}/dislike`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error("Error disliking comment:", error);
    }
  };

  const handlePin = async (commentId: number) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    try {
      let token = null;
      if (typeof window !== "undefined") {
        try {
          token = localStorage.getItem("user_auth_token");
        } catch (e) {
          console.warn("localStorage access denied");
        }
      }

      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          isPinned: !comment.isPinned,
        }),
      });

      if (res.ok) {
        toast.success(comment.isPinned ? "Comment unpinned" : "Comment pinned");
        fetchComments();
      }
    } catch (error) {
      toast.error("Failed to pin comment");
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      let token = null;
      if (typeof window !== "undefined") {
        try {
          token = localStorage.getItem("user_auth_token");
        } catch (e) {
          console.warn("localStorage access denied");
        }
      }

      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (res.ok) {
        toast.success("Comment deleted");
        fetchComments();
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  const topLevelComments = comments.slice(0, displayCount);
  const hasMore = comments.length > displayCount;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-primary/10 text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">
              Discussion
            </h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </p>
          </div>
        </div>
        
        {/* Sort Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold text-xs h-9">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Sort: {sortBy === "newest" ? "Newest" : "Popular"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuItem onClick={() => setSortBy("newest")} className="font-bold text-xs gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Newest
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("popular")} className="font-bold text-xs gap-2">
              <MessageSquare className="h-3.5 w-3.5" /> Popular
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Comment Form */}
      <div className="p-1">
        <CommentForm onSubmit={handleCommentSubmit} isAuthenticated={isAuthenticated} />
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-20 glass rounded-[2rem] border-dashed border-2 border-border/50">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground font-bold">No comments yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-1">
            {topLevelComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onLike={handleLike}
                onDislike={handleDislike}
                onDelete={handleDelete}
                onPin={handlePin}
                currentUserId={user?.id}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="ghost"
                onClick={() => setDisplayCount((prev) => prev + 10)}
                className="gap-2 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all px-8 h-12"
              >
                <ChevronDown className="h-4 w-4" />
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
