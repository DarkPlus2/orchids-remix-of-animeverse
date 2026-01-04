"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AdminSidebar } from "./AdminSidebar";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/login?redirect=/admin");
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Initializing Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <main className={cn(
        "flex-1 min-h-screen transition-all duration-300 overflow-x-auto",
        sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-64"
      )}>
        <div className="p-4 md:p-6 lg:p-8 pt-20 lg:pt-8 w-full min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
