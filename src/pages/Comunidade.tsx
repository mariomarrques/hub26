import { MessageSquare, Pin, Search, Users, Clock, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Topic {
  id: string;
  title: string;
  author: string;
  replies: number;
  lastActivity: string;
  isPinned?: boolean;
  category: string;
}

const categories = ["Todos", "Dúvidas", "Estratégias", "Fornecedores", "Resultados"];

const topics: Topic[] = [
  {
    id: "1",
    title: "📌 Regras do Fórum - Leia antes de postar",
    author: "Admin",
    replies: 0,
    lastActivity: "Fixado",
    isPinned: true,
    category: "Geral",
  },
  {
    id: "2",
    title: "📌 Como escolher seu primeiro produto para revenda",
    author: "Admin",
    replies: 45,
    lastActivity: "Fixado",
    isPinned: true,
    category: "Estratégias",
  },
  {
    id: "3",
    title: "Qual a melhor forma de testar um produto novo?",
    author: "Carlos M.",
    replies: 23,
    lastActivity: "Há 2 horas",
    category: "Dúvidas",
  },
  {
    id: "4",
    title: "Resultado: Vendi 50 camisas em 1 semana usando essa estratégia",
    author: "Ana Paula",
    replies: 67,
    lastActivity: "Há 4 horas",
    category: "Resultados",
  },
  {
    id: "5",
    title: "Fornecedor Quality Imports - Experiências recentes",
    author: "Lucas S.",
    replies: 18,
    lastActivity: "Há 1 dia",
    category: "Fornecedores",
  },
  {
    id: "6",
    title: "Precificação: como calcular margem ideal?",
    author: "Marina R.",
    replies: 31,
    lastActivity: "Há 1 dia",
    category: "Estratégias",
  },
  {
    id: "7",
    title: "Dúvida sobre frete para região Norte",
    author: "Pedro H.",
    replies: 8,
    lastActivity: "Há 2 dias",
    category: "Dúvidas",
  },
];

function TopicRow({ topic, index }: { topic: Topic; index: number }) {
  return (
    <article
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 ease-out hover:border-primary/30 hover:bg-surface-elevated animate-slide-up cursor-pointer",
        topic.isPinned && "border-primary/20 bg-primary/5"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Icon */}
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0",
        topic.isPinned ? "bg-primary/10" : "bg-muted"
      )}>
        {topic.isPinned ? (
          <Pin className="h-5 w-5 text-primary" />
        ) : (
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {topic.title}
        </h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>{topic.author}</span>
          <span className="rounded-full bg-muted px-2 py-0.5">{topic.category}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4" />
          <span>{topic.replies}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-[100px]">
          <Clock className="h-4 w-4" />
          <span>{topic.lastActivity}</span>
        </div>
      </div>
    </article>
  );
}

const Comunidade = () => {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopics = topics.filter((topic) => {
    const matchesCategory = activeCategory === "Todos" || topic.category === activeCategory;
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const pinnedTopics = filteredTopics.filter((t) => t.isPinned);
  const regularTopics = filteredTopics.filter((t) => !t.isPinned);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="animate-fade-in">
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

      {/* Topics */}
      <div className="space-y-3">
        {pinnedTopics.map((topic, index) => (
          <TopicRow key={topic.id} topic={topic} index={index} />
        ))}
        {regularTopics.map((topic, index) => (
          <TopicRow key={topic.id} topic={topic} index={index + pinnedTopics.length} />
        ))}
        {filteredTopics.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">Nenhum tópico encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comunidade;
