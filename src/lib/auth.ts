"use client";

import { AdminRole } from "./types/admin";

const AUTH_TOKEN_KEY = "admin_auth_token";
const ADMIN_DATA_KEY = "admin_data";

interface AdminData {
  id: number;
  username: string;
  role: AdminRole;
  email: string | null;
  createdAt: string;
  lastLogin: string | null;
  isActive: boolean;
}

export async function loginAdmin(username: string, password: string): Promise<{ success: boolean; error?: string; admin?: AdminData }> {
  try {
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Login failed" };
    }

    // Store token and admin data
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(data.admin));
      } catch (e) {
        console.warn("localStorage access denied");
      }
    }

    return { success: true, admin: data.admin };
  } catch (error) {
    return { success: false, error: "Network error. Please try again." };
  }
}

export async function verifyToken(): Promise<{ valid: boolean; admin?: AdminData }> {
  try {
    const token = getAuthToken();
    if (!token) return { valid: false };

    const response = await fetch("/api/admin/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      clearAuthToken();
      return { valid: false };
    }

    const data = await response.json();
    
    // Update stored admin data
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(data.admin));
      } catch (e) {
        console.warn("localStorage access denied");
      }
    }

    return { valid: true, admin: data.admin };
  } catch (error) {
    clearAuthToken();
    return { valid: false };
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    const token = getAuthToken();
    if (token) {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    clearAuthToken();
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (e) {
      console.warn("localStorage access denied");
      return null;
    }
  }
  return null;
}

export function getAdminData(): AdminData | null {
  if (typeof window !== "undefined") {
    try {
      const data = localStorage.getItem(ADMIN_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn("localStorage access denied");
      return null;
    }
  }
  return null;
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(ADMIN_DATA_KEY);
    } catch (e) {
      console.warn("localStorage access denied");
    }
  }
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

// Legacy function for backward compatibility
export function validateCredentials(username: string, password: string): boolean {
  return username === "admin" && password === "reenime_dark_2025";
}

export function setAuthToken(): void {
  // Legacy function - kept for compatibility but not used
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("reenime_admin_auth", "authenticated");
    } catch (e) {
      console.warn("localStorage access denied");
    }
  }
}