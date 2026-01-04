"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, X } from "lucide-react";

interface SocialLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SocialLinksDialog({ open, onOpenChange }: SocialLinksDialogProps) {
  const [telegramUrl, setTelegramUrl] = useState("");
  const [discordUrl, setDiscordUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const settings = await res.json();
          const telegram = settings.find((s: any) => s.key === "telegram_url");
          const discord = settings.find((s: any) => s.key === "discord_url");
          
          if (telegram) setTelegramUrl(telegram.value);
          if (discord) setDiscordUrl(discord.value);
        }
      } catch (error) {
        console.error("Error fetching social links:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchSocialLinks();
    }
  }, [open]);

  const handleJoinTelegram = () => {
    if (telegramUrl) {
      window.open(telegramUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleJoinDiscord = () => {
    if (discordUrl) {
      window.open(discordUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Join Our Community! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Connect with fellow anime fans and stay updated with the latest releases
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Telegram Button */}
          <Button
            onClick={handleJoinTelegram}
            disabled={loading || !telegramUrl}
            className="w-full h-14 gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <MessageCircle className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Join Telegram</span>
              <span className="text-xs opacity-90">Get instant updates</span>
            </div>
          </Button>

          {/* Discord Button */}
          <Button
            onClick={handleJoinDiscord}
            disabled={loading || !discordUrl}
            className="w-full h-14 gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            <Users className="h-5 w-5" />
            <div className="flex flex-col items-start">
              <span className="font-semibold">Join Discord</span>
              <span className="text-xs opacity-90">Chat with community</span>
            </div>
          </Button>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            Join our vibrant community for exclusive content, announcements, and discussions! 🚀
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
