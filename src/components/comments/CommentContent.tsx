"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CommentContentProps {
  content: string;
  isSpoiler?: boolean;
}

export function CommentContent({ content, isSpoiler: initialIsSpoiler }: CommentContentProps) {
  const [showSpoiler, setShowSpoiler] = useState(false);

  // Function to parse content for spoilers, markdown, and mentions
  const parseContent = (text: string) => {
    // Split by spoiler tags ||text||
    const parts = text.split(/(\|\|.*?\|\|)/g);

    return parts.map((part, index) => {
      // Handle spoilers ||text||
      if (part.startsWith("||") && part.endsWith("||")) {
        const spoilerText = part.slice(2, -2);
        return (
          <Spoiler key={index} text={spoilerText} />
        );
      }

      // Handle mentions @username
      const words = part.split(/(@\w+)/g);
      return words.map((word, wordIndex) => {
        if (word.startsWith("@")) {
          const username = word.slice(1);
          return (
            <Link
              key={`${index}-${wordIndex}`}
              href={`/profile/${username}`}
              className="text-primary hover:underline font-bold"
            >
              {word}
            </Link>
          );
        }

        // Basic Markdown-ish formatting
        // Bold **text**
        let formattedPart: any = word;
        if (/\*\*.*?\*\*/.test(word)) {
           const boldParts = word.split(/(\*\*.*?\*\*)/g);
           formattedPart = boldParts.map((bp, bIndex) => {
             if (bp.startsWith("**") && bp.endsWith("**")) {
               return <strong key={bIndex}>{bp.slice(2, -2)}</strong>;
             }
             return bp;
           });
        }

        return formattedPart;
      });
    });
  };

  if (initialIsSpoiler && !showSpoiler) {
    return (
      <div 
        onClick={() => setShowSpoiler(true)}
        className="mt-2 p-4 rounded-xl bg-muted/50 border border-dashed border-primary/30 cursor-pointer hover:bg-muted transition-colors text-center"
      >
        <p className="text-sm font-bold text-primary flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          This comment contains spoilers. Click to reveal.
        </p>
      </div>
    );
  }

  return (
    <div className="text-foreground mt-2 text-sm md:text-base whitespace-pre-wrap break-words leading-relaxed">
      {parseContent(content)}
    </div>
  );
}

function Spoiler({ text }: { text: string }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setRevealed(!revealed);
      }}
      className={cn(
        "inline-block rounded px-1 transition-all cursor-pointer",
        revealed 
          ? "bg-muted text-foreground" 
          : "bg-foreground text-transparent select-none hover:bg-foreground/80"
      )}
      title={revealed ? "Click to hide" : "Spoiler! Click to reveal"}
    >
      {text}
    </span>
  );
}
