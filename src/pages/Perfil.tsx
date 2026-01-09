import { useNavigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Perfil() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground text-sm mt-xs">
            Gerencie suas informações pessoais
          </p>
        </div>
        <Button onClick={() => navigate("/editar-perfil")} variant="outline">
          <Settings className="h-4 w-4 mr-xs" />
          Editar Perfil
        </Button>
      </div>

      <ProfileHeader 
        name={profile?.name || "Usuário"} 
        avatarUrl={profile?.avatar_url}
        createdAt={profile?.created_at}
      />
      <ProfileInfo email={user?.email} />
    </div>
  );
}
