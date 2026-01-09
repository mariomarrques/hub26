import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { NotificationsSettings } from "@/components/settings/NotificationsSettings";
import { PrivacySettings } from "@/components/settings/PrivacySettings";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Configuracoes() {
  return (
    <div className="flex flex-col gap-lg">
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
            <BreadcrumbPage>Configurações</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-xs">
          Personalize sua experiência no Hub 26
        </p>
      </div>

      <AccountSettings />
      <NotificationsSettings />
      <PrivacySettings />
    </div>
  );
}
