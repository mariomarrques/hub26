import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useNavLinks, type NavLink } from "@/hooks/use-nav-links";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, Save, Plus, Trash2, Link2, GripVertical } from "lucide-react";
import { toast } from "sonner";

const POSITION_LABELS: Record<string, string> = {
  navbar: "Navbar Superior",
  cssbuy: "CSSBuy (China)",
  catalogo: "Catálogo",
  suporte: "Suporte",
};

const AdminNavLinks = () => {
  const { navLinks, isLoading, updateLink, createLink, deleteLink } = useNavLinks();
  const [editedFields, setEditedFields] = useState<Record<string, { url?: string; label?: string }>>({});
  const [newItem, setNewItem] = useState({ key: "", label: "", position: "navbar", url: "", is_external: false });
  const [showAdd, setShowAdd] = useState(false);

  const positions = ["navbar", "cssbuy", "catalogo", "suporte"];

  const handleFieldChange = (id: string, field: "url" | "label", value: string) => {
    setEditedFields((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (link: NavLink) => {
    const changes = editedFields[link.id];
    if (!changes) return;
    try {
      await updateLink.mutateAsync({
        id: link.id,
        url: changes.url,
        label: changes.label,
      });
      setEditedFields((prev) => {
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
      toast.error("Preencha chave e label");
      return;
    }
    try {
      await createLink.mutateAsync({
        key: newItem.key,
        label: newItem.label,
        url: newItem.url || undefined,
        is_external: newItem.is_external,
        position: newItem.position,
        sort_order: navLinks.filter((l) => l.position === newItem.position).length,
      });
      setNewItem({ key: "", label: "", position: "navbar", url: "", is_external: false });
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
                  const edited = editedFields[link.id];
                  const currentLabel = edited?.label ?? link.label;
                  const currentUrl = edited?.url ?? link.url ?? "";
                  const hasChanges = edited !== undefined;
                  return (
                    <div key={link.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                      <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                      <div className="flex items-center gap-2 min-w-[60px]">
                        {link.is_external ? (
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <Link2 className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <Input
                        value={currentLabel}
                        onChange={(e) => handleFieldChange(link.id, "label", e.target.value)}
                        placeholder="Label"
                        className="w-40"
                      />
                      <Input
                        value={currentUrl}
                        onChange={(e) => handleFieldChange(link.id, "url", e.target.value)}
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
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(link)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
                {links.length === 0 && (
                  <p className="text-xs text-muted-foreground p-3">Nenhum link nesta seção</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Add new link */}
        {!showAdd ? (
          <Button variant="outline" onClick={() => setShowAdd(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Adicionar novo link
          </Button>
        ) : (
          <div className="space-y-3 p-4 bg-card border border-border rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Chave (única)</label>
                <Input
                  value={newItem.key}
                  onChange={(e) => setNewItem((p) => ({ ...p, key: e.target.value }))}
                  placeholder="navbar_novo_item"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Label</label>
                <Input
                  value={newItem.label}
                  onChange={(e) => setNewItem((p) => ({ ...p, label: e.target.value }))}
                  placeholder="Novo Item"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">URL</label>
                <Input
                  value={newItem.url}
                  onChange={(e) => setNewItem((p) => ({ ...p, url: e.target.value }))}
                  placeholder="/rota ou https://..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Posição</label>
                <Select value={newItem.position} onValueChange={(v) => setNewItem((p) => ({ ...p, position: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((p) => (
                      <SelectItem key={p} value={p}>{POSITION_LABELS[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newItem.is_external}
                onCheckedChange={(v) => setNewItem((p) => ({ ...p, is_external: v }))}
              />
              <label className="text-sm text-muted-foreground">Link externo (abre em nova aba)</label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd}>Adicionar</Button>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancelar</Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNavLinks;
