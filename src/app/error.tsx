"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw, Bug, Code, Info, Server } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 animate-pulse">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              500 - Server Error
            </h1>
            <p className="text-lg text-muted-foreground">
              Something went wrong on our end. Don't worry, we're on it!
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={() => reset()} className="gap-2">
            <RefreshCw className="h-5 w-5" />
            Try Again
          </Button>
          <Link href="/">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="h-5 w-5" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Debug Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Error Details */}
          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bug className="h-5 w-5 text-red-500" />
                Error Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Error Type</p>
                <p className="text-sm font-mono bg-muted/30 p-2 rounded border border-border">
                  {error.name || "Error"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Message</p>
                <p className="text-sm font-mono bg-muted/30 p-2 rounded border border-border break-words">
                  {error.message || "Unknown error occurred"}
                </p>
              </div>
              {error.digest && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Error ID</p>
                  <p className="text-sm font-mono bg-muted/30 p-2 rounded border border-border">
                    {error.digest}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stack Trace */}
          <Card className="border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-5 w-5 text-orange-500" />
                Stack Trace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[200px] overflow-y-auto">
                <pre className="text-xs font-mono bg-muted/30 p-3 rounded border border-border whitespace-pre-wrap break-words">
                  {error.stack || "No stack trace available"}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card className="border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                <p className="text-sm font-mono">
                  {new Date().toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">User Agent</p>
                <p className="text-xs font-mono truncate" title={navigator.userAgent}>
                  {navigator.userAgent.split(" ")[0]}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">URL</p>
                <p className="text-xs font-mono truncate" title={window.location.href}>
                  {window.location.pathname}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Viewport</p>
                <p className="text-xs font-mono">
                  {window.innerWidth} × {window.innerHeight}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">What happened?</p>
                <p className="text-xs text-muted-foreground">
                  An unexpected error occurred while processing your request. This information has been logged 
                  and our team will investigate. You can try refreshing the page or return to the homepage.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  If the problem persists, please contact support with the Error ID above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Code */}
        <p className="text-center text-xs text-muted-foreground">
          Error Code: 500 | Internal Server Error | {new Date().toISOString()}
        </p>
      </div>
    </div>
  );
}
