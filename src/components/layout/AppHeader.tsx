import { Hexagon } from "lucide-react";

export function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-sidebar-border bg-sidebar">
      <div className="flex h-full items-center px-lg">
        <div className="flex items-center gap-sm">
          <Hexagon className="h-6 w-6 text-primary" strokeWidth={1.5} />
          <span className="text-lg font-bold text-foreground tracking-tight">
            Hub 26
          </span>
        </div>
      </div>
    </header>
  );
}
