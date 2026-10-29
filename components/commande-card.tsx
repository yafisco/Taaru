import Link from "next/link";
import { Shirt } from "lucide-react";
import { DelaiBadge } from "@/components/delai-badge";
import { StatutBadge } from "@/components/statut-badge";
import type { Enums } from "@/lib/database.types";
import { formatDate, formatFCFA } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CommandeResume = {
  id: string;
  code: string;
  modele: string;
  clientNom: string;
  statut: Enums<"statut_commande">;
  dateLivraison: string | null;
  reste: number;
  enRetard: boolean;
  miniature: string | null;
};

// Carte compacte : miniature, client, modèle, délai, reste
export function CommandeCard({ c }: { c: CommandeResume }) {
  const enCours = c.statut === "recue" || c.statut === "coupe" || c.statut === "couture";

  return (
    <Link
      href={`/commandes/${c.id}`}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-2 pr-3 active:bg-muted",
        c.enRetard && "border-red-300 bg-red-50/60"
      )}
    >
      {c.miniature ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL signée d'une miniature de 15 Ko
        <img src={c.miniature} alt="" loading="lazy" className="size-16 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Shirt className="size-7" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{c.clientNom}</p>
        <p className="truncate text-sm text-muted-foreground">
          {c.modele} · n°{c.code}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {enCours && c.dateLivraison ? <DelaiBadge date={c.dateLivraison} /> : <StatutBadge statut={c.statut} />}
          {!enCours && c.dateLivraison && c.statut !== "livree" && (
            <span className="text-xs text-muted-foreground">{formatDate(c.dateLivraison)}</span>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right">
        {c.reste > 0 ? (
          <>
            <p className="text-xs text-muted-foreground">Reste</p>
            <p className="text-sm font-bold text-red-700">{formatFCFA(c.reste)}</p>
          </>
        ) : (
          <p className="text-xs font-semibold text-emerald-700">Payé ✓</p>
        )}
      </div>
    </Link>
  );
}
