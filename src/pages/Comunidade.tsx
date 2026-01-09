import { MessageSquare, Pin, Search, Users, Clock, MessageCircle, Plus, AlertCircle, X, Trash2, Heart, Home } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PostFormDialog } from "@/components/community/PostFormDialog";
import { PostDetailDialog } from "@/components/community/PostDetailDialog";
import { useCommunityPosts, CommunityPost } from "@/hooks/use-community-posts";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
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

const categories = ["Todos", "Dúvidas", "Estratégias", "Fornecedores", "Resultados", "Ferramentas", "Geral"];

const CATEGORY_MAP: Record<string, string> = {
  duvidas: "Dúvidas",
  estrategias: "Estratégias",
  fornecedores: "Fornecedores",
  resultados: "Resultados",
  ferramentas: "Ferramentas",
  geral: "Geral",
};

function TopicRow({ 
  post, 
  index, 
  onClick 
}: { 
  post: CommunityPost; 
  index: number; 
  onClick: () => void;
}) {
  return (
    <article
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 ease-out hover:border-primary/30 hover:bg-surface-elevated animate-slide-up cursor-pointer",
        post.is_pinned && "border-primary/20 bg-primary/5"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Icon */}
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0",
        post.is_pinned ? "bg-primary/10" : "bg-muted"
      )}>
        {post.is_pinned ? (
          <Pin className="h-5 w-5 text-primary" />
        ) : (
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>{post.author?.name || "Usuário"}</span>
          <span className="rounded-full bg-muted px-2 py-0.5">
            {CATEGORY_MAP[post.category] || post.category}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
        <div className="flex items-center gap-1">
          <Heart className="h-4 w-4" />
          <span>{post.likes_count || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments_count || 0}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>
      </div>
    </article>
  );
}

function MyPostsSection({ 
  posts, 
  onDelete 
}: { 
  posts: CommunityPost[]; 
  onDelete: (id: string) => void;
}) {
  const pendingPosts = posts.filter((p) => p.status === "pending");
  const rejectedPosts = posts.filter((p) => p.status === "rejected");

  if (pendingPosts.length === 0 && rejectedPosts.length === 0) return null;

  return (
    <Card className="border-dashed">
      <CardContent className="pt-4 space-y-3">
        <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Seus Tópicos
        </h3>
        
        {pendingPosts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 p-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{post.title}</p>
              <p className="text-xs text-muted-foreground">
                {CATEGORY_MAP[post.category] || post.category}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Pendente
              </Badge>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir tópico?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita.
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
            </div>
          </div>
        ))}

        {rejectedPosts.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{post.title}</p>
              {post.rejection_reason && (
                <p className="text-xs text-destructive mt-1">
                  Motivo: {post.rejection_reason}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">
                <X className="h-3 w-3 mr-1" />
                Rejeitado
              </Badge>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir tópico?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita.
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
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const Comunidade = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { approvedPosts, myPosts, loadingApproved, createPost, deletePost } = useCommunityPosts();

  const handlePostClick = (post: CommunityPost) => {
    setSelectedPost(post);
    setDetailDialogOpen(true);
  };

  const handleCreatePost = (post: { title: string; content: string; category: string }) => {
    createPost.mutate(post, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  const filteredPosts = approvedPosts.filter((post) => {
    const categoryLabel = CATEGORY_MAP[post.category] || post.category;
    const matchesCategory = activeCategory === "Todos" || categoryLabel === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const pinnedPosts = filteredPosts.filter((p) => p.is_pinned);
  const regularPosts = filteredPosts.filter((p) => !p.is_pinned);

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="animate-fade-in">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Comunidade</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <header className="animate-fade-in">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <p className="text-label">Fórum</p>
            </div>
            <h1 className="text-heading text-foreground mb-2">
              Comunidade
            </h1>
            <p className="text-body-muted">
              Troque experiências, tire dúvidas e aprenda com outros alunos.
            </p>
          </div>

          {user && (
            <Button className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo Tópico
            </Button>
          )}
        </div>
      </header>

      {/* Search */}
      <div className="relative animate-slide-up" style={{ animationDelay: "100ms" }}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar tópicos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border focus:border-primary"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: "150ms" }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150",
              activeCategory === category
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* My Posts (pending/rejected) */}
      {user && myPosts.length > 0 && (
        <MyPostsSection 
          posts={myPosts} 
          onDelete={(id) => deletePost.mutate(id)} 
        />
      )}

      {/* Topics */}
      <div className="space-y-3">
        {loadingApproved ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {pinnedPosts.map((post, index) => (
              <TopicRow key={post.id} post={post} index={index} onClick={() => handlePostClick(post)} />
            ))}
            {regularPosts.map((post, index) => (
              <TopicRow key={post.id} post={post} index={index + pinnedPosts.length} onClick={() => handlePostClick(post)} />
            ))}
            {filteredPosts.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-muted-foreground">Nenhum tópico encontrado.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Post Dialog */}
      <PostFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreatePost}
        isSubmitting={createPost.isPending}
      />

      {/* Post Detail Dialog */}
      <PostDetailDialog
        post={selectedPost}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onDelete={(postId) => {
          deletePost.mutate(postId, {
            onSuccess: () => setDetailDialogOpen(false),
          });
        }}
        isDeleting={deletePost.isPending}
      />
    </div>
  );
};

export default Comunidade;
