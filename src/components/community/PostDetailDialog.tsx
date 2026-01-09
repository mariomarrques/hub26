import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CommunityPost } from "@/hooks/use-community-posts";

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
}

export function PostDetailDialog({ post, open, onOpenChange }: PostDetailDialogProps) {
  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}
