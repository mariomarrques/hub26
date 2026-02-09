import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useNavLinks, type NavLink } from "@/hooks/use-nav-links";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExternalLink, Save, Plus, Trash2, Link2 } from "lucide-react";
import { toast } from "sonner";

const POSITION_LABELS: Record<string, string> = {
  cssbuy: "CSSBuy (China)",
  catalogo: "Catálogo",
  suporte: "Suporte",
};

const AdminNavLinks = () => {
  const { navLinks, isLoading, updateLink, createLink, deleteLink } = useNavLinks();
  const [editedUrls, setEditedUrls] = useState<Record<string, string>>({});
  const [newItem, setNewItem] = useState({ key: "", label: "", position: "catalogo" });
  const [showAdd, setShowAdd] = useState(false);

  const positions = ["cssbuy", "catalogo", "suporte"];

  const handleUrlChange = (id: string, url: string) => {
    setEditedUrls((prev) => ({ ...prev, [id]: url }));
  };

  const handleSave = async (link: NavLink) => {
    const newUrl = editedUrls[link.id];
    if (newUrl === undefined) return;
    try {
      await updateLink.mutateAsync({ id: link.id, url: newUrl || undefined });
      setEditedUrls((prev) => {
        const copy = { ...prev };
        delete copy[link.id];
        return copy;
      });
      toast.success(`Link "${link.label}" atualizado`);
    } catch {
      toast.error("Erro ao salvar link");
    }
  };

  const handleAdd = async () => {
    if (!newItem.key || !newItem.label) {
      toast.error("Preencha todos os campos");
      return;
    }
    try {
      await createLink.mutateAsync({
        key: newItem.key,
        label: newItem.label,
        is_external: true,
        position: newItem.position,
        sort_order: navLinks.filter((l) => l.position === newItem.position).length,
      });
      setNewItem({ key: "", label: "", position: "catalogo" });
      setShowAdd(false);
      toast.success("Link adicionado");
    } catch {
      toast.error("Erro ao adicionar link");
    }
  };

  const handleDelete = async (link: NavLink) => {
    try {
      await deleteLink.mutateAsync(link.id);
      toast.success(`Link "${link.label}" removido`);
    } catch {
      toast.error("Erro ao remover link");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {positions.map((position) => {
          const links = navLinks.filter((l) => l.position === position);
          return (
            <div key={position} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {POSITION_LABELS[position] || position}
              </h3>
              <div className="space-y-2">
                {links.map((link) => {
                  const currentUrl = editedUrls[link.id] ?? link.url ?? "";
                  const hasChanges = editedUrls[link.id] !== undefined;
                  return (
                    <div key={link.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                      <div className="flex items-center gap-2 min-w-[140px]">
                        {link.is_external ? (
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <Link2 className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium text-foreground">{link.label}</span>
                      </div>
                      <Input
                        value={currentUrl}
                        onChange={(e) => handleUrlChange(link.id, e.target.value)}
                        placeholder={link.is_external ? "https://..." : "/rota"}
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant={hasChanges ? "default" : "ghost"}
                        onClick={() => handleSave(link)}
                        disabled={!hasChanges}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      {position === "catalogo" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(link)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Add new link */}
        {!showAdd ? (
          <Button variant="outline" onClick={() => setShowAdd(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar link ao Catálogo
          </Button>
        ) : (
          <div className="flex items-end gap-3 p-4 bg-card border border-border rounded-lg">
            <div className="space-y-1 flex-1">
              <label className="text-xs text-muted-foreground">Chave (única)</label>
              <Input
                value={newItem.key}
                onChange={(e) => setNewItem((p) => ({ ...p, key: e.target.value }))}
                placeholder="catalogo_serie_a"
              />
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-xs text-muted-foreground">Label</label>
              <Input
                value={newItem.label}
                onChange={(e) => setNewItem((p) => ({ ...p, label: e.target.value }))}
                placeholder="Serie A"
              />
            </div>
            <Button onClick={handleAdd}>Adicionar</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancelar</Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNavLinks;
