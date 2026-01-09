import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppRole } from "@/types/auth";
import { useState } from "react";
import { UserWithRole } from "@/hooks/use-admin";

interface UserRoleDialogProps {
  user: UserWithRole | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (userId: string, newRole: AppRole) => void;
  isLoading?: boolean;
}

const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  moderator: "Moderador",
  member: "Membro",
};

export function UserRoleDialog({
  user,
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: UserRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedRole(null);
    }
    onOpenChange(open);
  };

  const handleConfirm = () => {
    if (user && selectedRole) {
      onConfirm(user.id, selectedRole);
    }
  };

  if (!user) return null;

  const currentRole = selectedRole || user.role;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Role do Usuário</DialogTitle>
          <DialogDescription>
            Selecione a nova role para este usuário
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url || undefined} />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nova Role</label>
          <Select
            value={currentRole}
            onValueChange={(value) => setSelectedRole(value as AppRole)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">{roleLabels.admin}</SelectItem>
              <SelectItem value="moderator">{roleLabels.moderator}</SelectItem>
              <SelectItem value="member">{roleLabels.member}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedRole || selectedRole === user.role || isLoading}
          >
            {isLoading ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
