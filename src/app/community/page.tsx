"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { 
  Users, MessageCircle, Heart, Share2, Bookmark, TrendingUp, Clock, Star, Send, 
  Image as ImageIcon, Shield, Pin, MoreHorizontal, Trash2, Edit, Flag, Crown, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface Post {
  id: number;
  authorName: string;
  authorIsAdmin: boolean;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  pinned: boolean;
  category: "announcement" | "discussion" | "news" | "question";
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  pinnedPosts: number;
  announcementCount: number;
  discussionCount: number;
  newsCount: number;
  questionCount: number;
}

const trendingTopics = [
  { tag: "#JujutsuKaisen", posts: "12.5K" },
  { tag: "#Frieren", posts: "9.8K" },
  { tag: "#SoloLeveling", posts: "15.1K" },
  { tag: "#DemonSlayer", posts: "8.2K" },
  { tag: "#OnePiece", posts: "18.3K" },
];

const categoryColors = {
  announcement: "bg-red-500/20 text-red-400 border-red-500/30",
  discussion: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  news: "bg-green-500/20 text-green-400 border-green-500/30",
  question: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const categoryLabels = {
  announcement: "📢 Announcement",
  discussion: "💬 Discussion",
  news: "📰 News",
  question: "❓ Question",
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [postCategory, setPostCategory] = useState<Post["category"]>("discussion");
  const [activeTab, setActiveTab] = useState<"all" | "announcements" | "discussions">("all");
  const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      // Check if user is admin from localStorage
      if (typeof window !== "undefined") {
        try {
          const adminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
          setIsAdmin(adminLoggedIn);
        } catch (e) {
          console.warn("localStorage access denied");
        }
      }
      
      // Fetch posts and stats
      fetchPosts();
      fetchStats();
    }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/community/posts?limit=50");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/community/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleLike = async (postId: number, currentLikes: number) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: currentLikes + 1 })
      });
      
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map(post => post.id === postId ? updatedPost : post));
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      toast.error("Failed to update likes");
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    if (!isAdmin) {
      toast.error("Only administrators can create posts");
      return;
    }
    
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: "AniStream Admin",
          content: newPost,
          category: postCategory,
          authorIsAdmin: true,
          pinned: false
        })
      });
      
      if (res.ok) {
        const createdPost = await res.json();
        setPosts([createdPost, ...posts]);
        setNewPost("");
        toast.success("Post published successfully!");
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  const handleDelete = async (postId: number) => {
    if (!isAdmin) return;
    
    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== postId));
        toast.success("Post deleted");
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handlePin = async (postId: number, currentPinned: boolean) => {
    if (!isAdmin) return;
    
    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !currentPinned })
      });
      
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(posts.map(post => post.id === postId ? updatedPost : post));
        toast.success("Post pin status updated");
      }
    } catch (error) {
      console.error("Error updating pin:", error);
      toast.error("Failed to update pin status");
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === "all") return true;
    if (activeTab === "announcements") return post.category === "announcement" || post.category === "news";
    if (activeTab === "discussions") return post.category === "discussion" || post.category === "question";
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 glow-accent">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Community
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Official announcements & discussions
                  </p>
                </div>
              </div>
              
              {isAdmin && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 rounded-full">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Admin</span>
                </div>
              )}
            </div>

            {/* Create Post - Admin Only */}
            {isAdmin ? (
              <div className="glass rounded-2xl p-4 border border-primary/30">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Admin Post</span>
                </div>
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                      A
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="Share an announcement or start a discussion..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="min-h-[100px] bg-background/50 border-border resize-none"
                    />
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Category:</span>
                        <select
                          value={postCategory}
                          onChange={(e) => setPostCategory(e.target.value as Post["category"])}
                          className="px-3 py-1.5 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="announcement">📢 Announcement</option>
                          <option value="news">📰 News</option>
                          <option value="discussion">💬 Discussion</option>
                          <option value="question">❓ Question</option>
                        </select>
                      </div>
                      <Button 
                        onClick={handlePost}
                        disabled={!newPost.trim()}
                        className="gap-2 gradient-primary"
                      >
                        <Send className="h-4 w-4" />
                        Publish
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-6 border border-border text-center">
                <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">Admin-Only Posting</h3>
                <p className="text-sm text-muted-foreground">
                  Only administrators can create posts. You can interact with existing posts by liking, commenting, and sharing.
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {[
                { key: "all", label: "All Posts", icon: Star },
                { key: "announcements", label: "Announcements", icon: TrendingUp },
                { key: "discussions", label: "Discussions", icon: MessageCircle },
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant={activeTab === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(key as typeof activeTab)}
                  className={`gap-2 rounded-xl flex-shrink-0 ${activeTab === key ? "gradient-primary" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Posts */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className={`glass rounded-2xl p-4 border transition-colors ${
                      post.pinned ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30"
                    }`}
                  >
                    {/* Pinned Badge */}
                    {post.pinned && (
                      <div className="flex items-center gap-1.5 text-primary text-xs font-medium mb-3">
                        <Pin className="h-3 w-3" />
                        Pinned Post
                      </div>
                    )}
                    
                    {/* Post Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {post.authorIsAdmin ? <Crown className="h-4 w-4" /> : post.authorName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-foreground">{post.authorName}</span>
                          {post.authorIsAdmin && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Admin
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${categoryColors[post.category]}`}>
                            {categoryLabels[post.category]}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{getTimeAgo(post.createdAt)}</span>
                      </div>
                      
                      {/* Admin Actions */}
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePin(post.id, post.pinned)}
                            className={`h-8 w-8 rounded-full ${post.pinned ? "text-primary" : "text-muted-foreground"}`}
                          >
                            <Pin className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(post.id)}
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <p className="text-foreground mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                    {/* Post Actions */}
                    <div className="flex items-center gap-4 pt-3 border-t border-border">
                      <button
                        onClick={() => handleLike(post.id, post.likes)}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        {post.likes.toLocaleString()}
                      </button>
                      <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments.toLocaleString()}
                      </button>
                      <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Share2 className="h-4 w-4" />
                        {post.shares.toLocaleString()}
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredPosts.length === 0 && (
                  <div className="text-center py-12 glass rounded-2xl">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">No posts found in this category</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <div className="glass rounded-2xl p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trending Topics
              </h3>
              <div className="space-y-3">
                {trendingTopics.map((topic) => (
                  <div key={topic.tag} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-primary font-medium text-sm group-hover:underline">
                      {topic.tag}
                    </span>
                    <span className="text-xs text-muted-foreground">{topic.posts} posts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="glass rounded-2xl p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Community Stats</h3>
              {stats ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Total Posts</span>
                    <span className="font-semibold">{stats.totalPosts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Total Likes</span>
                    <span className="font-semibold">{stats.totalLikes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Comments</span>
                    <span className="font-semibold">{stats.totalComments.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Shares</span>
                    <span className="font-semibold">{stats.totalShares.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Admin Info */}
            <div className="glass rounded-2xl p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                About This Community
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This is an official community managed by AniStream administrators. All posts are curated to provide the best anime news and discussions.
              </p>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Tip:</strong> Like, comment, and share posts to engage with the community!
                </p>
              </div>
            </div>

            {/* Guidelines */}
            <div className="glass rounded-2xl p-4 border border-border">
              <h3 className="font-semibold text-foreground mb-3">Community Guidelines</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Be respectful to others
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  No spoilers without tags
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Keep discussions on topic
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  No hate speech or harassment
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}