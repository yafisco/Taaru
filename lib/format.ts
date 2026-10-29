// lib/format.ts
import { format, differenceInCalendarDays } from "date-fns";
import { fr } from "date-fns/locale";

export const formatFCFA = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;

export const formatDate = (d: string | Date) => format(new Date(d), "EEE d MMM", { locale: fr }); // "jeu. 12 nov."

/** "Dans 3 j", "Aujourd'hui", "En retard de 2 j" */
export function delaiLivraison(d: string | Date): { texte: string; ton: "ok" | "bientot" | "retard" } {
  const j = differenceInCalendarDays(new Date(d), new Date());
  if (j < 0) return { texte: `En retard de ${-j} j`, ton: "retard" };
  if (j === 0) return { texte: "Aujourd'hui", ton: "bientot" };
  if (j <= 2) return { texte: `Dans ${j} j`, ton: "bientot" };
  return { texte: `Dans ${j} j`, ton: "ok" };
}

export const STATUTS = {
  recue:   { label: "Reçue",    couleur: "bg-slate-100 text-slate-700" },
  coupe:   { label: "Coupe",    couleur: "bg-amber-100 text-amber-800" },
  couture: { label: "Couture",  couleur: "bg-blue-100 text-blue-800" },
  prete:   { label: "Prête",    couleur: "bg-emerald-100 text-emerald-800" },
  livree:  { label: "Livrée",   couleur: "bg-zinc-200 text-zinc-600" },
  annulee: { label: "Annulée",  couleur: "bg-red-100 text-red-700" },
} as const;

export const ORDRE_STATUTS = ["recue", "coupe", "couture", "prete", "livree"] as const;
