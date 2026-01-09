import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminPosts, CommunityPost } from "@/hooks/use-community-posts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, Clock, MessageSquare, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_LABELS: Record<string, string> = {
  duvidas: "Dúvidas",
  estrategias: "Estratégias",
  fornecedores: "Fornecedores",
  resultados: "Resultados",
  ferramentas: "Ferramentas",
  geral: "Geral",
};

function PostCard({
  post,
  onApprove,
  onReject,
}: {
  post: CommunityPost;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author?.avatar_url || undefined} />
              <AvatarFallback>
                {post.author?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{post.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span>Por: {post.author?.name || "Usuário"}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary">{CATEGORY_LABELS[post.category] || post.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
          {post.content}
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={onReject}
          >
            <X className="h-4 w-4" />
            Rejeitar
          </Button>
          <Button size="sm" className="gap-2" onClick={onApprove}>
            <Check className="h-4 w-4" />
            Aprovar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RejectDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeitar Post</DialogTitle>
          <DialogDescription>
            Informe o motivo da rejeição (opcional). O autor será notificado.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Motivo da rejeição..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="min-h-[100px]"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Rejeitando..." : "Confirmar Rejeição"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminPosts() {
  const { pendingPosts, isLoading, approvePost, rejectPost } = useAdminPosts();
  const [rejectingPost, setRejectingPost] = useState<string | null>(null);

  const handleApprove = (postId: string) => {
    approvePost.mutate(postId);
  };

  const handleReject = (postId: string, reason: string) => {
    rejectPost.mutate({ postId, reason }, {
      onSuccess: () => setRejectingPost(null),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Posts Pendentes</h2>
            <p className="text-sm text-muted-foreground">
              Revise e aprove os tópicos enviados pelos usuários
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pendingPosts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-lg">Nenhum post pendente</h3>
              <p className="text-muted-foreground text-sm">
                Todos os posts foram revisados.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{pendingPosts.length} post(s) aguardando revisão</span>
            </div>
            {pendingPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onApprove={() => handleApprove(post.id)}
                onReject={() => setRejectingPost(post.id)}
              />
            ))}
          </div>
        )}
      </div>

      <RejectDialog
        open={!!rejectingPost}
        onOpenChange={(open) => !open && setRejectingPost(null)}
        onConfirm={(reason) => rejectingPost && handleReject(rejectingPost, reason)}
        isLoading={rejectPost.isPending}
      />
    </AdminLayout>
  );
}
