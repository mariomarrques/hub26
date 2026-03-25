import { ExternalLink, Globe, Instagram, Loader2, MessageCircle, Star, Users } from "lucide-react";
import type { ComponentType } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupplierDetails } from "@/hooks/use-suppliers";

interface SupplierDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: string | null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function RatingStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= value;

        return (
          <Star
            key={starValue}
            className={`h-3.5 w-3.5 ${isFilled ? "fill-warning text-warning" : "text-muted-foreground/40"}`}
          />
        );
      })}
    </div>
  );
}

function SupplierInfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-3 sm:px-4">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

type SupplierLinkButtonType = "whatsapp" | "group" | "instagram" | "site";

interface SupplierLinkButtonItem {
  type: SupplierLinkButtonType;
  url: string;
}

function normalizeLinkType(value?: string | null): SupplierLinkButtonType | null {
  if (!value) return null;
  if (value === "whatsapp" || value === "group" || value === "instagram" || value === "site") {
    return value;
  }
  return null;
}

function buildSupplierActionLinks({
  links,
  whatsapp_link,
  group_link,
}: {
  links?: Array<{ type: string; url: string }> | null;
  whatsapp_link?: string | null;
  group_link?: string | null;
}): SupplierLinkButtonItem[] {
  const order: SupplierLinkButtonType[] = ["whatsapp", "group", "instagram", "site"];
  const byType = new Map<SupplierLinkButtonType, string>();

  if (whatsapp_link) byType.set("whatsapp", whatsapp_link);
  if (group_link) byType.set("group", group_link);

  (links || []).forEach((item) => {
    const type = normalizeLinkType(item.type);
    const url = item.url?.trim();
    if (!type || !url) return;
    if (!byType.has(type)) byType.set(type, url);
  });

  return order
    .filter((type) => byType.has(type))
    .map((type) => ({ type, url: byType.get(type)! }));
}

function SupplierActionButton({
  type,
  url,
}: SupplierLinkButtonItem) {
  const config: Record<
    SupplierLinkButtonType,
    {
      label: string;
      icon: ComponentType<{ className?: string }>;
      className: string;
    }
  > = {
    whatsapp: {
      label: "WhatsApp",
      icon: MessageCircle,
      className:
        "border-emerald-300/60 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 hover:text-emerald-800",
    },
    group: {
      label: "Grupo",
      icon: Users,
      className:
        "border-border bg-muted/30 text-foreground hover:bg-muted/50",
    },
    instagram: {
      label: "Instagram",
      icon: Instagram,
      className:
        "border-pink-300/60 bg-pink-500/10 text-pink-700 hover:bg-pink-500/15 hover:text-pink-800",
    },
    site: {
      label: "Site",
      icon: Globe,
      className:
        "border-blue-300/60 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 hover:text-blue-800",
    },
  };

  const { label, icon: Icon, className } = config[type];

  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className={`h-9 gap-2 rounded-full px-3.5 ${className}`}
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
        <ExternalLink className="h-3.5 w-3.5 opacity-80" />
      </a>
    </Button>
  );
}

export function SupplierDetailsDialog({ open, onOpenChange, supplierId }: SupplierDetailsDialogProps) {
  const { data: supplier, isLoading, isError } = useSupplierDetails(supplierId || undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Detalhes do fornecedor</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
            <div className="inline-flex items-center gap-2 text-sm">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando detalhes...
            </div>
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            Não foi possível carregar os detalhes do fornecedor.
          </div>
        )}

        {!isLoading && !isError && !supplier && (
          <div className="rounded-2xl border border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            Fornecedor não encontrado.
          </div>
        )}

        {!isLoading && !isError && supplier && (
          <div className="space-y-5 sm:space-y-6">
            <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                <Avatar className="h-16 w-16 border border-border sm:h-20 sm:w-20">
                  <AvatarImage src={supplier.avatar_url || undefined} alt={supplier.name} />
                  <AvatarFallback>{getInitials(supplier.name)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="space-y-1">
                    <h3 className="truncate text-xl font-semibold text-foreground sm:text-2xl">
                      {supplier.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {supplier.country || "País não informado"}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium text-foreground">
                      {supplier.average_rating.toFixed(1)}
                    </span>
                    <span>({supplier.reviews_count} avaliações)</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <SupplierInfoItem
                label="Método de envio"
                value={supplier.shipping_method || "Não informado"}
              />
              <SupplierInfoItem
                label="Tempo de preparo"
                value={supplier.prep_time || "Não informado"}
              />
              <SupplierInfoItem
                label="Tempo de envio"
                value={supplier.shipping_time || "Não informado"}
              />
            </section>

            {supplier.description && (
              <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Descrição
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {supplier.description}
                </p>
              </section>
            )}

            {(() => {
              const actionLinks = buildSupplierActionLinks({
                links: supplier.links,
                whatsapp_link: supplier.whatsapp_link,
                group_link: supplier.group_link,
              });

              if (actionLinks.length === 0) return null;

              return (
                <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Redes e contato
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {actionLinks.map((link) => (
                      <SupplierActionButton key={`${link.type}-${link.url}`} {...link} />
                    ))}
                  </div>
                </section>
              );
            })()}

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Avaliações aprovadas
                </h4>
                <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  {supplier.reviews.length} avaliações
                </span>
              </div>

              {supplier.reviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                  <Star className="mx-auto mb-2 h-4 w-4 text-muted-foreground/70" />
                  Ainda não há avaliações aprovadas para este fornecedor.
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {supplier.reviews.map((review) => (
                    <article key={review.id} className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarImage
                              src={review.reviewer.avatar_url || undefined}
                              alt={review.reviewer.name}
                            />
                            <AvatarFallback>
                              {getInitials(review.reviewer.name || "Usuário")}
                            </AvatarFallback>
                          </Avatar>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {review.reviewer.name || "Usuário"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {formatDate(review.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-muted/20 px-2.5 py-1">
                          <RatingStars value={review.rating} />
                          <span className="text-xs font-medium text-muted-foreground">{review.rating}/5</span>
                        </div>
                      </div>

                      {review.comment && (
                        <p className="text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
                      )}

                      {review.image_url && (
                        <img
                          src={review.image_url}
                          alt="Imagem da avaliação"
                          className="w-full max-h-72 rounded-lg border border-border/80 object-cover"
                        />
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
