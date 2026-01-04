"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { Loader2, User, Camera, Save, ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
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
import { toast } from "sonner";
import Link from "next/link";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    bio: "",
    profilePicture: "",
    banner: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user) {
      setFormData({
        username: user.username || "",
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        profilePicture: user.profilePicture || "",
        banner: user.banner || "",
      });
    }
  }, [isAuthenticated, user, router]);

  const handleImageUpload = async (file: File, type: "avatar" | "banner") => {
    const IMGBB_API_KEY = "0b3ec5f978bd470c31aef10435420e72";
    const formData = new FormData();
    formData.append("image", file);

    const toastId = toast.loading(`Uploading ${type}...`);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        const url = data.data.url;
        if (type === "avatar") {
          setFormData(prev => ({ ...prev, profilePicture: url }));
        } else {
          setFormData(prev => ({ ...prev, banner: url }));
        }
        toast.success(`${type === "avatar" ? "Avatar" : "Banner"} uploaded!`, { id: toastId });
      } else {
        toast.error("Failed to upload image", { id: toastId });
      }
    } catch (error) {
      toast.error("Error uploading image", { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let token = null;
      if (typeof window !== "undefined") {
        try {
          token = localStorage.getItem("user_auth_token");
        } catch (e) {
          console.warn("localStorage access denied");
        }
      }
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        window.location.reload();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      let token = null;
      if (typeof window !== "undefined") {
        try {
          token = localStorage.getItem("user_auth_token");
        } catch (e) {
          console.warn("localStorage access denied");
        }
      }
      const res = await fetch("/api/users/profile", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Account deleted successfully");
        localStorage.removeItem("user_auth_token");
        localStorage.removeItem("user_data");
        router.push("/");
        window.location.reload();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to delete account");
      }
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 pt-24 max-w-3xl">
        <Link href={`/profile/${user.username}`}>
          <Button variant="ghost" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
        </Link>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-2xl">Profile Settings</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Banner Section */}
                <div className="space-y-4">
                  <div className="group relative h-40 w-full rounded-xl bg-muted overflow-hidden border border-border">
                    {formData.banner ? (
                      <img 
                        src={formData.banner} 
                        alt="Banner Preview" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <Camera className="h-8 w-8 opacity-50" />
                        <span className="text-sm font-medium">No banner set</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Label htmlFor="banner-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2 text-white">
                          <Camera className="h-8 w-8" />
                          <span className="text-sm font-medium">Upload Banner</span>
                        </div>
                        <input
                          id="banner-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, "banner");
                          }}
                        />
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="banner" className="text-sm font-semibold">Banner URL</Label>
                    <Input
                      id="banner"
                      type="url"
                      placeholder="https://example.com/banner.jpg"
                      value={formData.banner}
                      onChange={(e) =>
                        setFormData({ ...formData, banner: e.target.value })
                      }
                      className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      Recommended: 1200x400px • Max 5MB
                    </p>
                  </div>
                </div>

                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 py-6 border-y border-border/50">
                  <div className="group relative">
                    <Avatar className="h-28 w-28 ring-4 ring-primary/20 ring-offset-4 ring-offset-background transition-transform duration-300 group-hover:scale-105">
                      <AvatarImage src={formData.profilePicture || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                        {formData.name?.charAt(0).toUpperCase() || formData.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "avatar");
                        }}
                      />
                    </Label>
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="profilePicture" className="text-sm font-semibold">Avatar URL</Label>
                      <Input
                        id="profilePicture"
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        value={formData.profilePicture}
                        onChange={(e) =>
                          setFormData({ ...formData, profilePicture: e.target.value })
                        }
                        className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      Square images work best • Max 2MB
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Display Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-semibold">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      required
                      className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>


              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="bg-background/50 border-border/50 focus:border-primary transition-colors"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-semibold">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px] resize-none bg-background/50 border-border/50 focus:border-primary transition-colors"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right font-medium">
                  {formData.bio.length}/500 characters
                </p>
              </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-6">
                  <Button
                    type="submit"
                    className="flex-1 gradient-primary rounded-xl font-bold h-12 shadow-lg shadow-primary/20"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Link href={`/profile/${user.username}`} className="flex-1">
                    <Button type="button" variant="outline" className="w-full rounded-xl font-bold h-12 border-border/50">
                      Cancel
                    </Button>
                  </Link>
                </div>

                {/* Danger Zone */}
                <div className="pt-8 mt-8 border-t border-red-500/20">
                  <div className="flex items-center gap-2 mb-4 text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Danger Zone</h3>
                  </div>
                  <Card className="border-red-500/20 bg-red-500/5 rounded-2xl shadow-none">
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground">Delete Account</p>
                          <p className="text-xs text-muted-foreground">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive" className="rounded-xl font-bold bg-red-500 hover:bg-red-600 transition-colors">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Account
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2rem] border-red-500/20 glass">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-black flex items-center gap-2 text-red-500">
                                <AlertTriangle className="h-6 w-6" />
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground font-medium">
                                This action will permanently delete your account, including your watchlist, 
                                favorites, watch history, and all comments. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                              <AlertDialogCancel className="rounded-xl font-bold border-border">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleDeleteAccount}
                                className="rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white"
                              >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Delete Everything"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
