"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Search, Loader2, MoreHorizontal, 
  Trash2, Ban, CheckCircle, RefreshCw, Shield, ShieldAlert,
  Mail, Clock, User as UserIcon, Activity, Zap
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: number;
  username: string;
  role: string;
  email: string | null;
  name: string | null;
  createdAt: string;
  lastLogin: string | null;
  status: string;
}

export default function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        toast.success(`Role updated to ${newRole}`);
        fetchUsers();
      } else {
        toast.error("Failed to update role");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleUpdateStatus = async (userId: number, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      if (response.ok) {
        toast.success(`User status updated to ${newStatus}`);
        fetchUsers();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === "admins") return matchesSearch && u.role === "admin";
    if (activeTab === "banned") return matchesSearch && u.status === "banned";
    return matchesSearch;
  });

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="w-full space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Users className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">User Registry</h1>
            </div>
            <p className="text-muted-foreground text-base md:text-xl font-medium ml-1">Comprehensive community governance and access control</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-2xl border border-border/50">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-xs font-black uppercase tracking-widest opacity-70">Active Sessions: {users.length}</span>
            </div>
            <Button variant="outline" size="lg" className="rounded-2xl h-14 w-14" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-10">
          <div className="flex flex-col xl:flex-row gap-4 xl:gap-6 justify-between items-stretch xl:items-center bg-muted/30 p-2 md:p-3 rounded-3xl xl:rounded-[2.5rem] border border-border/50 shadow-inner">
            <TabsList className="bg-transparent h-auto flex-wrap justify-start gap-1">
              <TabsTrigger value="all" className="rounded-2xl md:rounded-[1.75rem] px-4 md:px-10 h-10 gap-2 data-[state=active]:bg-card data-[state=active]:shadow-2xl font-black uppercase tracking-widest text-[10px]">
                <Users className="h-4 w-4" /> <span className="hidden sm:inline">All Members</span><span className="sm:hidden">All</span>
              </TabsTrigger>
              <TabsTrigger value="admins" className="rounded-2xl md:rounded-[1.75rem] px-4 md:px-10 h-10 gap-2 data-[state=active]:bg-card data-[state=active]:shadow-2xl font-black uppercase tracking-widest text-[10px]">
                <Shield className="h-4 w-4" /> <span className="hidden sm:inline">System Admins</span><span className="sm:hidden">Admins</span>
              </TabsTrigger>
              <TabsTrigger value="banned" className="rounded-2xl md:rounded-[1.75rem] px-4 md:px-10 h-10 gap-2 data-[state=active]:bg-card data-[state=active]:shadow-2xl font-black uppercase tracking-widest text-[10px]">
                <Ban className="h-4 w-4" /> <span className="hidden sm:inline">Restricted</span><span className="sm:hidden">Banned</span>
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full xl:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="SEARCH IDENTIFICATION..." 
                className="h-12 md:h-14 rounded-2xl md:rounded-[1.75rem] bg-card border-none shadow-2xl pl-14 font-black uppercase tracking-widest text-[10px] focus-visible:ring-primary/20" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <Card className="border-none shadow-2xl bg-card rounded-3xl md:rounded-[3.5rem] overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/10">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border/50">
                      <th className="p-4 md:p-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Identity Node</th>
                      <th className="p-4 md:p-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Access Level</th>
                      <th className="p-4 md:p-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Operational Status</th>
                      <th className="p-4 md:p-8 font-black uppercase tracking-widest text-[10px] text-muted-foreground">Node Age</th>
                      <th className="p-4 md:p-8 text-right font-black uppercase tracking-widest text-[10px] text-muted-foreground">Directives</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {loading ? (
                      <tr><td colSpan={5} className="py-20 md:py-32 text-center"><Loader2 className="h-12 w-12 animate-spin mx-auto text-primary/20" /></td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} className="py-20 md:py-32 text-center text-muted-foreground font-black text-xl italic opacity-30">NO MATCHING IDENTITIES FOUND</td></tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-muted/10 transition-colors group">
                          <td className="p-4 md:p-8">
                            <div className="flex items-center gap-4 md:gap-6">
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-lg md:text-2xl border border-primary/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                {u.username[0].toUpperCase()}
                              </div>
                              <div className="space-y-1">
                                <p className="font-black text-base md:text-xl tracking-tighter group-hover:text-primary transition-colors truncate max-w-[150px] md:max-w-none">{u.name || u.username}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[10px] md:text-xs text-muted-foreground font-medium">
                                  <span className="flex items-center gap-1 truncate max-w-[120px] md:max-w-none"><Mail className="h-3 w-3" /> {u.email}</span>
                                  <span className="hidden sm:inline opacity-30">|</span>
                                  <span>@{u.username}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 md:p-8">
                            <Badge 
                              className={u.role === 'admin' 
                                ? 'bg-primary/10 text-primary border-primary/20 font-black text-[10px] px-3 md:px-4 py-1 md:py-1.5 rounded-full' 
                                : 'bg-muted text-muted-foreground border-none font-black text-[10px] px-3 md:px-4 py-1 md:py-1.5 rounded-full'
                              }
                            >
                              {u.role.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4 md:p-8">
                            {u.status === 'active' ? (
                              <div className="flex items-center gap-2 text-green-500 font-black text-[10px] md:text-xs uppercase tracking-widest">
                                <Zap className="h-3 w-3 md:h-4 md:w-4 fill-green-500" /> Authorized
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-red-500 font-black text-[10px] md:text-xs uppercase tracking-widest">
                                <ShieldAlert className="h-3 w-3 md:h-4 md:w-4 fill-red-500" /> Terminated
                              </div>
                            )}
                          </td>
                          <td className="p-4 md:p-8">
                            <div className="space-y-1">
                              <p className="text-xs md:text-sm font-black">{new Date(u.createdAt).toLocaleDateString()}</p>
                              <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-50 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Registry Entry
                              </p>
                            </div>
                          </td>
                          <td className="p-4 md:p-8 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl hover:bg-primary/10 hover:text-primary transition-all">
                                  <MoreHorizontal className="h-5 w-5 md:h-6 md:w-6" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 md:w-64 p-2 md:p-3 rounded-2xl md:rounded-[1.5rem] border-none shadow-2xl bg-card">
                                <DropdownMenuLabel className="px-4 pb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin Overrides</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-muted/50 mb-2" />
                                
                                {u.role === 'admin' ? (
                                  <DropdownMenuItem onClick={() => handleUpdateRole(u.id, 'user')} className="rounded-xl h-12 gap-3 font-black text-xs cursor-pointer focus:bg-primary/10 focus:text-primary">
                                    <Users className="h-4 w-4" /> Revoke Admin Access
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleUpdateRole(u.id, 'admin')} className="rounded-xl h-12 gap-3 font-black text-xs cursor-pointer focus:bg-primary/10 focus:text-primary">
                                    <Shield className="h-4 w-4" /> Grant Admin Access
                                  </DropdownMenuItem>
                                )}
                                
                                <DropdownMenuSeparator className="bg-muted/50 my-2" />
                                
                                {u.status === 'active' ? (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(u.id, 'banned')} className="rounded-xl h-12 gap-3 font-black text-xs cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10">
                                    <Ban className="h-4 w-4" /> Terminate Access
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(u.id, 'active')} className="rounded-xl h-12 gap-3 font-black text-xs cursor-pointer text-green-500 focus:text-green-500 focus:bg-green-500/10">
                                    <CheckCircle className="h-4 w-4" /> Restore Access
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
