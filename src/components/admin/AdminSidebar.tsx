"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Film, PlayCircle, Users, Calendar, Settings, 
  LogOut, ChevronLeft, ChevronRight, Zap, MessageSquare,
  TrendingUp, BarChart3, Shield, Menu, X, UserCog, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { 
    label: "Dashboard", 
    href: "/admin", 
    icon: LayoutDashboard,
    description: "Overview & Analytics"
  },
  { 
    label: "Anime", 
    href: "/admin/anime", 
    icon: Film,
    description: "Manage anime library"
  },
  { 
    label: "Episodes", 
    href: "/admin/episodes", 
    icon: PlayCircle,
    description: "Manage video content"
  },
  { 
    label: "Comments", 
    href: "/admin/comments", 
    icon: MessageCircle,
    description: "Moderate user comments"
  },
  { 
    label: "Community", 
    href: "/admin/community", 
    icon: MessageSquare,
    description: "Posts & moderation"
  },
  { 
    label: "Analytics", 
    href: "/admin/analytics", 
    icon: BarChart3,
    description: "Traffic & engagement"
  },
  { 
    label: "Admin Users", 
    href: "/admin/users", 
    icon: UserCog,
    description: "Manage accounts"
  },
  { 
    label: "Settings", 
    href: "/admin/settings", 
    icon: Settings,
    description: "System configuration"
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function AdminSidebar({ collapsed, setCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-6 border-b border-border",
        collapsed ? "justify-center" : ""
      )}>
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-xl gradient-primary blur-lg opacity-50" />
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl gradient-primary shadow-lg">
            <Zap className="h-5 w-5 text-white fill-white" />
          </div>
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-foreground">AniStream</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                active 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                collapsed ? "justify-center" : ""
              )}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-transform",
                active ? "" : "group-hover:scale-110"
              )} />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.label}</p>
                  {active && (
                    <p className="text-[10px] opacity-80 truncate">{item.description}</p>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-xl bg-muted/50 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground truncate">{user.username}</span>
            </div>
            <Badge className="text-[10px] px-1.5 py-0 border bg-red-500/20 text-red-500 border-red-500/30">
              {user.role.toUpperCase()}
            </Badge>
          </div>
        )}
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            collapsed ? "px-0 justify-center" : "justify-start gap-3"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl glass-strong lg:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 lg:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex fixed top-0 left-0 h-full bg-card border-r border-border z-40 flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}>
        <SidebarContent />
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 p-1.5 rounded-full bg-card border border-border shadow-lg hover:bg-muted transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>
    </>
  );
}
