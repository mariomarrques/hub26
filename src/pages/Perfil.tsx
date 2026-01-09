import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { currentUser } from "@/data/mockData";

export default function Perfil() {
  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground text-sm mt-xs">
          Gerencie suas informações e acompanhe suas estatísticas
        </p>
      </div>

      <ProfileHeader user={currentUser} />
      <ProfileStats user={currentUser} />
      <ProfileInfo user={currentUser} />
    </div>
  );
}
