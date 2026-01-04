"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Menu, X, ChevronDown, Sparkles, TrendingUp, Library, Zap, Home, Calendar, Users, Shield, FileText, Lock, AlertTriangle, User, LogOut, Settings, Heart, Bookmark, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const genres = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
  "Horror", "Romance", "Sci-Fi", "Slice of Life", "Sports"
];

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [showLegalDropdown, setShowLegalDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout, isAdmin: authIsAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = () => {
      if (typeof window !== "undefined") {
        try {
          const adminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
          setIsAdmin(authIsAdmin || adminLoggedIn);
        } catch (e) {
          console.warn("localStorage access denied");
          setIsAdmin(authIsAdmin);
        }
      } else {
        setIsAdmin(authIsAdmin);
      }
    };

    checkAdminStatus();
    
    // Also listen for storage changes in case of multi-tab login
    window.addEventListener('storage', checkAdminStatus);
    return () => window.removeEventListener('storage', checkAdminStatus);
  }, [authIsAdmin]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
          <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            isScrolled 
              ? "glass-strong shadow-lg shadow-black/20 py-0.5" 
              : "bg-gradient-to-b from-black/60 to-transparent py-1.5"
          }`}>
            <div className="container mx-auto px-4">
              <div className="flex h-10 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-lg gradient-primary blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
                    <div className="relative flex items-center justify-center w-7 h-7 rounded-lg gradient-primary shadow-lg">
                      <Zap className="h-3 w-3 text-white fill-white" />
                    </div>
                  </div>
                  <span className="text-sm font-black text-white tracking-tighter uppercase">
                    AniStream
                  </span>
                </Link>
    
                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-0.5">
                  <Link href="/">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px] font-black uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                      Home
                    </Button>
                  </Link>
                  <Link href="/browse">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px] font-black uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                      Browse
                    </Button>
                  </Link>
                  <Link href="/trending">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px] font-black uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                      Trending
                    </Button>
                  </Link>
                  <Link href="/schedule">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px] font-black uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                      Schedule
                    </Button>
                  </Link>
                    <Link href="/community">
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px] font-black uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                        Community
                      </Button>
                    </Link>
    
                    {isAdmin && (
                      <Link href="/admin">
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                          Dashboard
                        </Button>
                      </Link>
                    )}
  
                
                {/* Genres Dropdown */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 gap-1 text-[10px] font-black uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    onMouseEnter={() => setShowGenreDropdown(true)}
                    onMouseLeave={() => setShowGenreDropdown(false)}
                  >
                    Genres
                    <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${showGenreDropdown ? "rotate-180" : ""}`} />
                  </Button>
                  
                  {showGenreDropdown && (
                    <div 
                      className="absolute top-full left-0 mt-1 w-72 glass-strong rounded-xl shadow-2xl shadow-black/40 p-2 border border-white/10"
                      onMouseEnter={() => setShowGenreDropdown(true)}
                      onMouseLeave={() => setShowGenreDropdown(false)}
                    >
                      <div className="grid grid-cols-2 gap-0.5">
                        {genres.map((genre) => (
                          <Link
                            key={genre}
                            href={`/browse?genre=${genre.toLowerCase()}`}
                            className="px-2.5 py-2 text-xs text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 rounded-lg transition-all duration-200"
                          >
                            {genre}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
  
                {/* Legal Dropdown */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 gap-1 text-[10px] font-black uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    onMouseEnter={() => setShowLegalDropdown(true)}
                    onMouseLeave={() => setShowLegalDropdown(false)}
                  >
                    <FileText className="h-3 w-3" />
                    Legal
                    <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${showLegalDropdown ? "rotate-180" : ""}`} />
                  </Button>
                  
                  {showLegalDropdown && (
                    <div 
                      className="absolute top-full right-0 mt-1 w-56 glass-strong rounded-xl shadow-2xl shadow-black/40 p-1.5 border border-white/10"
                      onMouseEnter={() => setShowLegalDropdown(true)}
                      onMouseLeave={() => setShowLegalDropdown(false)}
                    >
                      <Link
                        href="/terms"
                        className="flex items-center gap-2 px-2.5 py-2 text-xs text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 rounded-lg transition-all duration-200"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        Terms
                      </Link>
                      <Link
                        href="/privacy"
                        className="flex items-center gap-2 px-2.5 py-2 text-xs text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 rounded-lg transition-all duration-200"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Privacy
                      </Link>
                      <Link
                        href="/disclaimer"
                        className="flex items-center gap-2 px-2.5 py-2 text-xs text-white/60 hover:text-white hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 rounded-lg transition-all duration-200"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Disclaimer
                      </Link>
                    </div>
                  )}
                </div>
              </div>
  
              {/* Search & Actions */}
              <div className="flex items-center gap-2">
                <form onSubmit={handleSearch} className="relative hidden md:block group">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors" />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="w-44 lg:w-56 h-8 pl-8 pr-3 text-xs bg-white/5 border border-white/10 focus:bg-white/10 focus:border-primary/50 rounded-lg transition-all placeholder:text-white/30 outline-none text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
  
                {/* User Menu - Desktop */}
                {isAuthenticated && user ? (
                  <div className="hidden lg:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all p-0">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profilePicture || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 glass-strong border-white/10">
                        <DropdownMenuLabel>
                          <div className="flex flex-col space-y-0.5">
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-white/60">@{user.username}</p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem asChild className="cursor-pointer text-xs">
                          <Link href={`/profile/${user.username}`} className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5" />
                            My Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer text-xs">
                          <Link href="/profile/settings" className="flex items-center gap-2">
                            <Settings className="h-3.5 w-3.5" />
                            Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem asChild className="cursor-pointer text-xs">
                          <Link href={`/profile/${user.username}?tab=favorites`} className="flex items-center gap-2">
                            <Heart className="h-3.5 w-3.5" />
                            Favorites
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer text-xs">
                          <Link href={`/profile/${user.username}?tab=watchlist`} className="flex items-center gap-2">
                            <Bookmark className="h-3.5 w-3.5" />
                            Watchlist
                          </Link>
                        </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer text-xs">
                            <Link href={`/profile/${user.username}?tab=history`} className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5" />
                              Watch History
                            </Link>
                          </DropdownMenuItem>
  
                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem asChild className="cursor-pointer text-primary focus:text-primary focus:bg-primary/10 transition-colors text-xs">
                                <Link href="/admin" className="flex items-center gap-2 font-medium">
                                  <Shield className="h-3.5 w-3.5" />
                                  Admin Dashboard
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
  
                          <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive text-xs">
                          <LogOut className="h-3.5 w-3.5 mr-2" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="hidden lg:flex items-center gap-1.5">
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="h-7 px-2.5 text-[10px] font-black uppercase tracking-wider text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="h-7 px-3.5 text-[10px] font-black uppercase tracking-wider gradient-primary rounded-lg text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
                
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMenuOpen ? (
                    <X className="h-4 w-4 text-white" />
                  ) : (
                    <Menu className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>


      {/* Mobile Floating Sidebar */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Floating Sidebar */}
          <div 
            ref={menuRef}
            className="absolute top-4 right-4 bottom-4 w-[280px] glass-strong rounded-3xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden animate-in slide-in-from-right-5 duration-300"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
                  <Zap className="h-4 w-4 text-white fill-white" />
                </div>
                <span className="font-semibold text-white">AniStream</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-white/70" />
              </button>
            </div>

            {/* User Info - Mobile */}
            {isAuthenticated && user ? (
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src={user.profilePicture || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-white/60 truncate">@{user.username}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-3.5 w-3.5" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-destructive/10 hover:bg-destructive/20 rounded-lg text-xs text-destructive transition-all"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b border-white/10">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    className="flex items-center justify-center px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center px-3 py-2 gradient-primary rounded-lg text-sm text-white transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="p-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  type="search"
                  placeholder="Search anime..."
                  className="w-full pl-10 bg-white/5 border-white/10 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Navigation Links */}
            <div className="px-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 24rem)' }}>
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                Home
              </Link>
              <Link
                href="/browse"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <Library className="h-5 w-5" />
                Browse
              </Link>
              <Link
                href="/trending"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <TrendingUp className="h-5 w-5" />
                Trending
              </Link>
              <Link
                href="/schedule"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar className="h-5 w-5" />
                Schedule
              </Link>
              <Link
                href="/community"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="h-5 w-5" />
                Community
              </Link>

              {/* User Quick Links - Mobile */}
              {isAuthenticated && (
                <>
                  <div className="h-px bg-white/10 my-2" />
                  <Link
                    href={`/profile/${user.username}?tab=favorites`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5" />
                    Favorites
                  </Link>
                  <Link
                    href={`/profile/${user.username}?tab=watchlist`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bookmark className="h-5 w-5" />
                    Watchlist
                  </Link>
                  <Link
                    href={`/profile/${user.username}?tab=history`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Clock className="h-5 w-5" />
                    Watch History
                  </Link>
                </>
              )}
              
              {/* Admin Panel Link - Only visible when logged in */}
              {isAdmin && (
                <>
                  <div className="h-px bg-white/10 my-2" />
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 transition-all border border-primary/30"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Admin Panel</span>
                  </Link>
                </>
              )}
              
              {/* Genres Section */}
              <div className="pt-4">
                <p className="px-2 text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Genres</p>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Link
                      key={genre}
                      href={`/browse?genre=${genre.toLowerCase()}`}
                      className="px-3 py-1.5 text-xs bg-white/5 hover:bg-primary/20 rounded-full text-white/60 hover:text-white transition-all border border-white/10 hover:border-primary/30"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Legal Section */}
              <div className="pt-4 pb-4">
                <p className="px-2 text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Legal</p>
                <div className="space-y-1">
                  <Link
                    href="/terms"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Terms of Service
                  </Link>
                  <Link
                    href="/privacy"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Lock className="h-4 w-4" />
                    Privacy Policy
                  </Link>
                  <Link
                    href="/disclaimer"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Disclaimer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}