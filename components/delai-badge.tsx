import { delaiLivraison } from "@/lib/format";
import { cn } from "@/lib/utils";

const TONS = {
  ok: "bg-muted text-muted-foreground",
  bientot: "bg-amber-100 text-amber-800",
  retard: "bg-red-100 text-red-700",
} as const;

// « Dans 3 j », « Aujourd'hui », « En retard de 2 j »
export function DelaiBadge({ date, className }: { date: string; className?: string }) {
  const { texte, ton } = delaiLivraison(date);
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold", TONS[ton], className)}>
      {texte}
    </span>
  );
}
