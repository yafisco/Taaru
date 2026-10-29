"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatDate, formatFCFA } from "@/lib/format";
import { supprimerPaiement } from "../actions";
import { MODES_PAIEMENT } from "../schemas";

type Paiement = { id: string; montant: number; mode: string; paye_le: string };

export function PaiementsListe({ paiements }: { paiements: Paiement[] }) {
  const [aConfirmer, setAConfirmer] = useState<string | null>(null);
  const [enCours, startTransition] = useTransition();

  if (paiements.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun paiement pour l&apos;instant.</p>;
  }

  function supprimer(p: Paiement) {
    startTransition(async () => {
      const r = await supprimerPaiement(p.id);
      if (r.erreur) return void toast.error(r.erreur);
      toast.success(`Paiement de ${formatFCFA(p.montant)} supprimé`);
      setAConfirmer(null);
    });
  }

  return (
    <ul className="divide-y text-sm">
      {paiements.map((p, i) =>
        aConfirmer === p.id ? (
          <li key={p.id} role="alert" className="space-y-2 bg-red-50 px-2 py-3">
            <p className="font-medium text-red-800">Supprimer ce paiement de {formatFCFA(p.montant)} ?</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-10" onClick={() => setAConfirmer(null)}>
                Non
              </Button>
              <Button variant="destructive" className="h-10" disabled={enCours} onClick={() => supprimer(p)}>
                {enCours && <Loader2 className="animate-spin" />}
                Oui, supprimer
              </Button>
            </div>
          </li>
        ) : (
          <li key={p.id} className="flex items-center gap-2 py-1">
            <span className="flex-1">
              {formatDate(p.paye_le)} · {MODES_PAIEMENT.find((m) => m.cle === p.mode)?.label ?? "Autre"}
              {i === 0 && <span className="text-muted-foreground"> (acompte)</span>}
            </span>
            <span className="font-semibold">{formatFCFA(p.montant)}</span>
            <button
              type="button"
              onClick={() => setAConfirmer(p.id)}
              aria-label={`Supprimer le paiement de ${formatFCFA(p.montant)}`}
              className="flex size-10 items-center justify-center text-muted-foreground active:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        )
      )}
    </ul>
  );
}
