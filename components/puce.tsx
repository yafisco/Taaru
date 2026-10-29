import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<"button">, "type"> & { actif?: boolean };

// Bouton « puce » sélectionnable (modèles, montants rapides, dates, événements)
export function Puce({ actif = false, className, ...props }: Props) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      className={cn(
        "h-10 shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap active:scale-95",
        actif ? "border-primary bg-primary text-primary-foreground" : "bg-background",
        className
      )}
      {...props}
    />
  );
}
