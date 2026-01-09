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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Pin, Heart, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CommunityPost } from "@/hooks/use-community-posts";
import { usePostComments, usePostLikes, PostComment } from "@/hooks/use-post-interactions";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
}: { 
  comment: PostComment; 
  currentUserId?: string;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const isOwner = currentUserId === comment.author_id;

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-0">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.author?.avatar_url || undefined} />
        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
          {comment.author?.name?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {comment.author?.name || "Usuário"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
          {isOwner && (
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
        <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

export function PostDetailDialog({ post, open, onOpenChange, onDelete, isDeleting }: PostDetailDialogProps) {
  const { user, isAdmin, isModerator } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const { comments, isLoading: loadingComments, addComment, deleteComment } = usePostComments(post?.id);
  const { likesCount, hasLiked, toggleLike } = usePostLikes(post?.id);

  if (!post) return null;

  const canDeletePost = user?.id === post.author_id || isAdmin || isModerator;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
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

        {/* Likes */}
        <div className="flex items-center gap-4 py-3 border-t border-border">
          {user ? (
            <Button
              variant={hasLiked ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLike.mutate()}
              disabled={toggleLike.isPending}
              className="gap-2"
            >
              <Heart className={cn("h-4 w-4", hasLiked && "fill-current")} />
              {hasLiked ? "Curtido" : "Curtir"}
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled className="gap-2">
              <Heart className="h-4 w-4" />
              Curtir
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            {likesCount} {likesCount === 1 ? "curtida" : "curtidas"}
          </span>
        </div>

        {/* Comentários */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Comentários ({comments.length})
          </h4>

          {loadingComments ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-0">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.id}
                  onDelete={() => handleDeleteComment(comment.id)}
                  isDeleting={deletingCommentId === comment.id}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          )}

          {/* Form para adicionar comentário */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="flex gap-2 pt-2">
              <Input
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!newComment.trim() || addComment.isPending}
              >
                {addComment.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Enviar"
                )}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              Faça login para comentar.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
