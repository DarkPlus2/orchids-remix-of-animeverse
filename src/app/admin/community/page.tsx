"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Eye, Heart, Users, TrendingUp, MessageCircle, ThumbsUp, Activity, Loader2, Pin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Post {
  id: number;
  authorName: string;
  authorIsAdmin: boolean;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  pinned: boolean;
  category: string;
  createdAt: string;
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

export default function CommunityManagementPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await fetch("/api/community/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch recent posts
      const postsRes = await fetch("/api/community/posts?limit=10");
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setRecentPosts(postsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load community data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setRecentPosts(recentPosts.filter(p => p.id !== postId));
        toast.success("Post deleted");
        fetchData(); // Refresh all data
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handlePin = async (postId: number, currentPinned: boolean) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !currentPinned })
      });
      
      if (res.ok) {
        const updatedPost = await res.json();
        setRecentPosts(recentPosts.map(post => post.id === postId ? updatedPost : post));
        toast.success("Post pin status updated");
        fetchData(); // Refresh stats
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
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  const calculateEngagement = () => {
    if (!stats || stats.totalPosts === 0) return 0;
    const totalInteractions = stats.totalLikes + stats.totalComments + stats.totalShares;
    return ((totalInteractions / stats.totalPosts) * 100).toFixed(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              Community Management
            </h1>
            <p className="text-muted-foreground mt-1">Monitor community engagement and activity</p>
          </div>
          <Button onClick={fetchData} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>

        {loading && !stats ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Posts</p>
                      <p className="text-2xl font-bold mt-1">{stats.totalPosts.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Likes</p>
                      <p className="text-2xl font-bold mt-1">{stats.totalLikes.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Comments</p>
                      <p className="text-2xl font-bold mt-1">{stats.totalComments.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Shares</p>
                      <p className="text-2xl font-bold mt-1">{stats.totalShares.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Pin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pinned Posts</p>
                      <p className="text-lg font-semibold">{stats.pinnedPosts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <MessageSquare className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Announcements</p>
                      <p className="text-lg font-semibold">{stats.announcementCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Discussions</p>
                      <p className="text-lg font-semibold">{stats.discussionCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Activity className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                      <p className="text-lg font-semibold">{calculateEngagement()}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>Latest community posts and activity</CardDescription>
              </CardHeader>
              <CardContent>
                {recentPosts.length > 0 ? (
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/20 border border-border">
                        <div className={`p-2 rounded-lg ${
                          post.category === 'announcement' ? 'bg-red-500/10' :
                          post.category === 'news' ? 'bg-green-500/10' :
                          post.category === 'discussion' ? 'bg-blue-500/10' :
                          'bg-yellow-500/10'
                        }`}>
                          <MessageSquare className={`h-4 w-4 ${
                            post.category === 'announcement' ? 'text-red-500' :
                            post.category === 'news' ? 'text-green-500' :
                            post.category === 'discussion' ? 'text-blue-500' :
                            'text-yellow-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium">{post.authorName}</p>
                                {post.pinned && (
                                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center gap-1">
                                    <Pin className="h-3 w-3" />
                                    Pinned
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground capitalize">• {post.category}</span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePin(post.id, post.pinned)}
                                className={`h-8 w-8 ${post.pinned ? 'text-primary' : 'text-muted-foreground'}`}
                              >
                                <Pin className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(post.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post.likes.toLocaleString()} likes
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {post.comments.toLocaleString()} comments
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {post.shares.toLocaleString()} shares
                            </span>
                            <span>• {getTimeAgo(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No posts available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Post Categories</CardTitle>
                  <CardDescription>Distribution of post types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                      <span className="font-medium text-sm">📢 Announcements</span>
                      <span className="text-sm font-semibold text-red-500">{stats.announcementCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                      <span className="font-medium text-sm">📰 News</span>
                      <span className="text-sm font-semibold text-green-500">{stats.newsCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                      <span className="font-medium text-sm">💬 Discussions</span>
                      <span className="text-sm font-semibold text-blue-500">{stats.discussionCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                      <span className="font-medium text-sm">❓ Questions</span>
                      <span className="text-sm font-semibold text-yellow-500">{stats.questionCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Community Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Discussion Forums</p>
                        <p className="text-sm text-muted-foreground">Users can interact with posts, share reviews, and discuss anime</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                        <ThumbsUp className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Rating System</p>
                        <p className="text-sm text-muted-foreground">Like and upvote posts to highlight quality content</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Admin Management</p>
                        <p className="text-sm text-muted-foreground">Full control over posts with pin, edit, and delete capabilities</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No data available</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}