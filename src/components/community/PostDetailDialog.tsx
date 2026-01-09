import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Pin, Heart, Trash2, Loader2, Send, Reply, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CommunityPost, useAdminPosts } from "@/hooks/use-community-posts";
import { usePostComments, usePostLikes, PostComment } from "@/hooks/use-post-interactions";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MentionInput } from "./MentionInput";
import { MentionText } from "./MentionText";

const CATEGORY_MAP: Record<string, string> = {
  duvidas: "Dúvidas",
  estrategias: "Estratégias",
  fornecedores: "Fornecedores",
  resultados: "Resultados",
  ferramentas: "Ferramentas",
  geral: "Geral",
};

interface PostDetailDialogProps {
  post: CommunityPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (postId: string) => void;
  isDeleting?: boolean;
}

function CommentItem({ 
  comment, 
  currentUserId,
  onDelete,
  isDeleting,
  onReply,
  depth = 0,
  isAdmin,
  isModerator,
}: { 
  comment: PostComment; 
  currentUserId?: string;
  onDelete: () => void;
  isDeleting: boolean;
  onReply?: (parentId: string, content: string) => void;
  depth?: number;
  isAdmin?: boolean;
  isModerator?: boolean;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  
  const repliesCount = comment.replies?.length || 0;
  
  const isOwner = currentUserId === comment.author_id;
  const canDelete = isOwner || isAdmin || isModerator;
  const canReply = !!currentUserId && depth < 2;

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !onReply) return;
    setIsSubmitting(true);
    onReply(comment.id, replyText.trim());
    setReplyText("");
    setShowReplyInput(false);
    setIsSubmitting(false);
  };

  return (
    <div className={cn("py-3", depth === 0 && "border-b border-border last:border-0")}>
      <div className="flex gap-3">
        <Avatar className={cn("flex-shrink-0", depth > 0 ? "h-6 w-6" : "h-8 w-8")}>
          <AvatarImage src={comment.author?.avatar_url || undefined} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {comment.author?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={cn("font-medium text-foreground", depth > 0 ? "text-xs" : "text-sm")}>
                {comment.author?.name || "Usuário"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {canReply && onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowReplyInput(!showReplyInput)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Responder
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
          <MentionText 
            content={comment.content} 
            className={cn("text-foreground mt-1 whitespace-pre-wrap", depth > 0 ? "text-xs" : "text-sm")}
          />
          
          {/* Input de resposta */}
          {showReplyInput && (
            <div className="mt-3 relative">
              <MentionInput
                placeholder="Escreva uma resposta... Use @ para mencionar"
                value={replyText}
                onChange={setReplyText}
                multiline
                className="w-full min-h-[80px] pr-14 rounded-2xl bg-muted/40 border border-border/50 focus-within:bg-background focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-300 resize-none text-sm"
              />
              <button
                type="button"
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || isSubmitting}
                className="absolute right-3 bottom-3 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:bg-muted transition-all duration-300 shadow-sm hover:shadow-md"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Indicador de respostas colapsável */}
      {repliesCount > 0 && (
        <button
          type="button"
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mt-3 ml-11 py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
        >
          <ChevronDown className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            !showReplies && "-rotate-90"
          )} />
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="font-medium">
            {repliesCount} {repliesCount === 1 ? 'resposta' : 'respostas'}
          </span>
        </button>
      )}

      {/* Respostas aninhadas */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-2 pl-4 border-l-2 border-muted space-y-0">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onDelete={onDelete}
              isDeleting={isDeleting}
              onReply={onReply}
              depth={depth + 1}
              isAdmin={isAdmin}
              isModerator={isModerator}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PostDetailDialog({ post, open, onOpenChange, onDelete, isDeleting }: PostDetailDialogProps) {
  const { user, isAdmin, isModerator } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [commentSent, setCommentSent] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<string[]>([]);
  const [showComments, setShowComments] = useState(false);

  const { comments, isLoading: loadingComments, addComment, deleteComment, addReply } = usePostComments(post?.id);
  const { likesCount, hasLiked, toggleLike } = usePostLikes(post?.id);
  const { togglePinPost } = useAdminPosts();

  if (!post) return null;

  const canDeletePost = user?.id === post.author_id || isAdmin || isModerator;
  const canPinPost = isAdmin || isModerator;

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addComment.mutate(newComment.trim(), {
      onSuccess: () => setNewComment(""),
    });
  };

  const handleDeleteComment = (commentId: string) => {
    setDeletingCommentId(commentId);
    deleteComment.mutate(commentId, {
      onSettled: () => setDeletingCommentId(null),
    });
  };

  const handleLike = () => {
    toggleLike.mutate();
    
    // Adiciona coração flutuante
    const heartId = Date.now().toString();
    setFloatingHearts((prev) => [...prev, heartId]);
    
    // Remove após animação
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((id) => id !== heartId));
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4 duration-300">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <Badge variant="secondary">
                {CATEGORY_MAP[post.category] || post.category}
              </Badge>
              {post.is_pinned && (
                <Badge className="bg-primary/10 text-primary border-0">
                  <Pin className="h-3 w-3 mr-1" />
                  Fixado
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {canPinPost && (
                <Button
                  variant={post.is_pinned ? "default" : "outline"}
                  size="sm"
                  className="gap-1"
                  onClick={() => togglePinPost.mutate(post.id)}
                  disabled={togglePinPost.isPending}
                >
                  {togglePinPost.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Pin className="h-4 w-4" />
                      {post.is_pinned ? "Desfixar" : "Fixar"}
                    </>
                  )}
                </Button>
              )}
              {canDeletePost && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir tópico?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. O tópico e todos os comentários serão removidos permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(post.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          <DialogTitle className="text-xl leading-relaxed">
            {post.title}
          </DialogTitle>
        </DialogHeader>

        {/* Autor e data */}
        <div className="flex items-center gap-3 py-4 border-b border-border">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {post.author?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">
              {post.author?.name || "Usuário"}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="py-4">
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Interações: Likes e Comentários */}
        <div className="flex items-center gap-3 py-4 border-t border-border">
          {/* Botão de Like */}
          <div className="relative">
            {/* Corações flutuantes */}
            {floatingHearts.map((id) => (
              <Heart
                key={id}
                className="absolute -top-2 left-1/2 -translate-x-1/2 h-6 w-6 text-red-500 fill-red-500 animate-float-up pointer-events-none"
              />
            ))}
            
            {user ? (
              <Button
                variant="ghost"
                onClick={handleLike}
                disabled={toggleLike.isPending}
                className={cn(
                  "gap-2.5 text-base px-4 py-2.5 h-auto transition-all duration-300",
                  hasLiked 
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
                    : "hover:bg-red-500/10 hover:text-red-500"
                )}
              >
                <Heart className={cn(
                  "h-5 w-5 transition-all duration-200",
                  hasLiked && "fill-red-500 text-red-500 scale-110"
                )} />
                <span className="font-medium">{likesCount}</span>
              </Button>
            ) : (
              <Button variant="ghost" disabled className="gap-2.5 text-base px-4 py-2.5 h-auto opacity-50">
                <Heart className="h-5 w-5" />
                <span className="font-medium">{likesCount}</span>
              </Button>
            )}
          </div>

          {/* Botão de Comentários */}
          <Button
            variant="ghost"
            onClick={() => setShowComments(!showComments)}
            className={cn(
              "gap-2.5 text-base px-4 py-2.5 h-auto transition-all duration-300",
              showComments 
                ? "bg-primary/10 text-primary hover:bg-primary/20" 
                : "hover:bg-muted"
            )}
          >
            <MessageCircle className={cn(
              "h-5 w-5 transition-all duration-200",
              showComments && "fill-primary/20"
            )} />
            <span className="font-medium">{comments.length}</span>
          </Button>
        </div>

        {/* Comentários - Condicional */}
        {showComments && (
          <div className="space-y-4 pt-6 border-t border-border animate-in fade-in-0 slide-in-from-top-2 duration-300">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comentários ({comments.length})
            </h4>

            {loadingComments ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-0 max-h-[350px] overflow-y-auto pr-2">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={user?.id}
                    onDelete={() => handleDeleteComment(comment.id)}
                    isDeleting={deletingCommentId === comment.id}
                    onReply={(parentId, content) => addReply.mutate({ parentId, content })}
                    isAdmin={isAdmin}
                    isModerator={isModerator}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center bg-muted/30 rounded-lg">
                Nenhum comentário ainda. Seja o primeiro!
              </p>
            )}

            {/* Form para adicionar comentário */}
            {user ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newComment.trim() || addComment.isPending) return;
                addComment.mutate(newComment.trim(), {
                  onSuccess: () => {
                    setNewComment("");
                    setCommentSent(true);
                    setTimeout(() => setCommentSent(false), 600);
                  },
                });
              }} className="pt-6">
                <div className="relative">
                  <MentionInput
                    placeholder="Escreva um comentário... Use @ para mencionar"
                    value={newComment}
                    onChange={setNewComment}
                    multiline
                    className="w-full min-h-[100px] pr-16 rounded-2xl bg-muted/40 border border-border/50 focus-within:bg-background focus-within:border-primary/30 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-300 resize-none text-base"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || addComment.isPending}
                    className={cn(
                      "absolute right-4 bottom-4 p-3 rounded-full transition-all duration-300 shadow-sm hover:shadow-md",
                      commentSent 
                        ? "bg-green-500 text-white scale-110" 
                        : "bg-primary text-primary-foreground hover:bg-primary/90",
                      "disabled:opacity-40 disabled:bg-muted disabled:shadow-none disabled:scale-100"
                    )}
                  >
                    {addComment.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className={cn("h-5 w-5 transition-transform duration-200", commentSent && "scale-0")} />
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6 bg-muted/30 rounded-2xl">
                Faça login para comentar.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
