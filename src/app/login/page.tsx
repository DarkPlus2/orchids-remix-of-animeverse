"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Mail, Lock, AlertCircle, Zap, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ emailOrUsername?: string; password?: string }>({});

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const validateForm = () => {
    const newErrors: { emailOrUsername?: string; password?: string } = {};

    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Email or username is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData.emailOrUsername, formData.password);

      if (result.success) {
        toast.success("Welcome back!", {
          description: "You have successfully logged in.",
        });
        router.push("/");
      } else {
        toast.error("Login failed", {
          description: result.error || "Invalid email/username or password",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />
      </div>

      <Card className="w-full max-w-md border-border/50 shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl gradient-primary blur-xl opacity-50" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg">
                <Zap className="h-8 w-8 text-white fill-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue watching
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email or Username
              </Label>
              <Input
                id="emailOrUsername"
                type="text"
                placeholder="Enter your email or username"
                value={formData.emailOrUsername}
                onChange={(e) => {
                  setFormData({ ...formData, emailOrUsername: e.target.value });
                  setErrors({ ...errors, emailOrUsername: undefined });
                }}
                className={`${errors.emailOrUsername ? "border-destructive" : ""}`}
                autoComplete="username"
                disabled={loading}
              />
              {errors.emailOrUsername && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.emailOrUsername}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setErrors({ ...errors, password: undefined });
                  }}
                  className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.password}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary h-11 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex flex-col space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Don't have an account?
              </span>
            </div>
          </div>

          <Link href="/register" className="w-full">
            <Button variant="outline" className="w-full" disabled={loading}>
              Create Account
            </Button>
          </Link>

          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
