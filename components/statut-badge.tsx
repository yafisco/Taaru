import { STATUTS } from "@/lib/format";
import type { Enums } from "@/lib/database.types";
import { cn } from "@/lib/utils";

export function StatutBadge({ statut, className }: { statut: Enums<"statut_commande">; className?: string }) {
  const { label, couleur } = STATUTS[statut];
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold", couleur, className)}>
      {label}
    </span>
  );
}
