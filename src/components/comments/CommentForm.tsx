"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Send, Smile, Info, AlertTriangle, Bold, Italic, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CommentFormProps {
  onSubmit: (content: string, isSpoiler?: boolean) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  isAuthenticated: boolean;
}

const EMOJIS = ["😊", "😂", "🥰", "🤔", "😮", "😢", "🔥", "✨", "👏", "👍", "👎", "❤️", "🎉", "👀", "💯"];

export function CommentForm({
  onSubmit,
  onCancel,
  placeholder = "Share your thoughts...",
  isAuthenticated,
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(content, isSpoiler);
      setContent("");
      setIsSpoiler(false);
    } finally {
      setSubmitting(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  const wrapText = (symbol: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    setContent(`${before}${symbol}${selected}${symbol}${after}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="glass rounded-xl p-6 text-center space-y-3">
        <p className="text-muted-foreground text-sm">
          Please login to join the discussion
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/login">
            <Button size="sm">Login</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" variant="outline">
              Register
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-xl p-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 md:h-10 md:w-10 ring-2 ring-primary/20 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs md:text-sm font-semibold">
            {user?.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

          <div className="flex-1 space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="min-h-[100px] resize-none bg-background/50 border-border/50 focus:border-primary rounded-xl p-4 text-sm md:text-base transition-all focus:ring-2 focus:ring-primary/20"
              disabled={submitting}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 self-start">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-2 grid grid-cols-5 gap-1" side="top">
                    {EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-lg text-lg transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                <div className="h-4 w-px bg-border mx-1" />

                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => wrapText("**")}
                  title="Bold (**text**)"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => wrapText("||")}
                  title="Spoiler (||text||)"
                >
                  <AlertTriangle className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                <div className="flex items-center space-x-2 mr-2">
                  <Switch
                    id="spoiler-mode"
                    checked={isSpoiler}
                    onCheckedChange={setIsSpoiler}
                  />
                  <Label htmlFor="spoiler-mode" className="text-xs font-bold cursor-pointer text-muted-foreground">
                    Spoiler
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  {onCancel && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={onCancel}
                      disabled={submitting}
                      className="rounded-xl h-9 px-4 text-xs font-bold"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!content.trim() || submitting}
                    className="gap-2 gradient-primary shadow-lg shadow-primary/20 rounded-xl h-9 px-6 text-xs font-bold"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

      </div>
    </form>
  );
}
