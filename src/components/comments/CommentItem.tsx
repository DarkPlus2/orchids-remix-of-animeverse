"use client";

import { useState } from "react";
import { CommentForm } from "./CommentForm";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, MessageSquare, MoreVertical, Trash2, Flag, Pin, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { CommentContent } from "./CommentContent";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Comment {
  id: number;
  userId: number;
  animeId: number;
  content: string;
  parentCommentId: number | null;
  likes: number;
  dislikes: number;
  isPinned: boolean;
  isSpoiler: boolean;
  createdAt: string;
  user: {
    id: number;
    username: string;
    name: string;
    profilePicture: string | null;
    role?: string;
  };
  replies: Comment[];
  isLiked?: boolean;
  isDisliked?: boolean;
}

interface CommentItemProps {
  comment: Comment;
  onReply: (parentCommentId: number, content: string, isSpoiler?: boolean) => void;
  onLike: (commentId: number) => void;
  onDislike: (commentId: number) => void;
  onDelete: (commentId: number) => void;
  onPin?: (commentId: number) => void;
  currentUserId?: number;
  depth?: number;
}

export function CommentItem({
  comment,
  onReply,
  onLike,
  onDislike,
  onDelete,
  onPin,
  currentUserId,
  depth = 0,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  if (!comment) return null;

  const isOwner = currentUserId === comment.userId;
  const isAdmin = comment.user?.role === "admin";
  const maxDepth = 3;
  const canReply = depth < maxDepth;

  const fallbackUser = {
    name: "Deleted User",
    username: "deleted",
    profilePicture: null,
  };

  const user = {
    name: comment.user?.name || fallbackUser.name,
    username: comment.user?.username || fallbackUser.username,
    profilePicture: comment.user?.profilePicture || fallbackUser.profilePicture,
  };

  const handleReplySubmit = async (content: string, isSpoiler?: boolean) => {
    await onReply(comment.id, content, isSpoiler);
    setShowReplyForm(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative",
        depth > 0 ? "ml-6 md:ml-10 mt-4" : "mt-6"
      )}
    >
      {/* Threading Line */}
      {depth > 0 && (
        <div className="absolute -left-6 md:-left-10 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />
      )}

      <div className={cn(
        "glass rounded-[1.5rem] p-4 md:p-5 space-y-3 transition-all border-border/50",
        comment.isPinned && "ring-2 ring-primary/20 bg-primary/5 border-primary/20 shadow-lg shadow-primary/5"
      )}>
        {/* Comment Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 md:h-11 md:w-11 rounded-2xl ring-2 ring-background shadow-md">
              <AvatarImage src={user.profilePicture || undefined} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-foreground text-sm md:text-base hover:text-primary transition-colors cursor-pointer">
                  {user.name}
                </span>
                
                {isAdmin && (
                  <Badge variant="secondary" className="h-5 bg-primary/10 text-primary border-primary/20 text-[10px] font-black px-1.5 uppercase tracking-wider gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Staff
                  </Badge>
                )}

                <span className="text-[10px] md:text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-full">
                  @{user.username}
                </span>
                
                <span className="text-xs text-muted-foreground">•</span>
                
                <span className="text-[10px] md:text-xs text-muted-foreground font-medium">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>

                {comment.isPinned && (
                  <div className="flex items-center gap-1 text-primary animate-pulse">
                    <Pin className="h-3 w-3 fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Pinned</span>
                  </div>
                )}
              </div>

              {/* Comment Content */}
              <CommentContent content={comment.content} isSpoiler={comment.isSpoiler} />

              {/* Comment Actions */}
              <div className="flex items-center gap-2 md:gap-4 mt-4">
                <div className="flex items-center bg-muted/30 rounded-full p-0.5 border border-border/50 shadow-sm">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onLike(comment.id)}
                    className={cn(
                      "gap-1.5 h-7 px-2.5 rounded-full transition-all",
                      comment.isLiked ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <ThumbsUp className={cn("h-3.5 w-3.5", comment.isLiked && "fill-current")} />
                    <span className="text-xs font-bold">{comment.likes}</span>
                  </Button>
                  <div className="w-px h-3 bg-border mx-0.5" />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDislike(comment.id)}
                    className={cn(
                      "gap-1.5 h-7 px-2.5 rounded-full transition-all",
                      comment.isDisliked ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-destructive"
                    )}
                  >
                    <ThumbsDown className={cn("h-3.5 w-3.5", comment.isDisliked && "fill-current")} />
                    <span className="text-xs font-bold">{comment.dislikes}</span>
                  </Button>
                </div>

                {canReply && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="gap-1.5 h-8 px-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all font-bold"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="text-xs">Reply</span>
                  </Button>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowReplies(!showReplies)}
                    className="gap-1.5 h-8 px-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all font-bold"
                  >
                    <span className="text-xs">
                      {showReplies ? "Hide" : "Show"} {comment.replies.length} {comment.replies.length === 1 ? "Reply" : "Replies"}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 rounded-xl p-0 hover:bg-muted transition-colors">
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl">
              {isOwner || isAdmin ? (
                <>
                  {onPin && (isAdmin || isOwner) && (
                    <DropdownMenuItem onClick={() => onPin(comment.id)} className="cursor-pointer gap-2 font-medium">
                      <Pin className="h-4 w-4" />
                      {comment.isPinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => onDelete(comment.id)}
                    className="text-destructive cursor-pointer gap-2 font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem className="cursor-pointer gap-2 font-medium">
                  <Flag className="h-4 w-4" />
                  Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Reply Form */}
      <AnimatePresence>
        {showReplyForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 ml-6 md:ml-10">
              <CommentForm
                onSubmit={handleReplySubmit}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`Replying to @${user.username}...`}
                isAuthenticated={!!currentUserId}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nested Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              onDislike={onDislike}
              onDelete={onDelete}
              onPin={onPin}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
