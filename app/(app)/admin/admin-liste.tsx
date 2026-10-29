"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Crown, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFCFA } from "@/lib/format";
import { FORMULES_PRO, LIMITE_GRATUIT } from "@/lib/offre";
import { simplifier } from "@/lib/texte";
import { afficherTelephone } from "@/lib/whatsapp";
import { prolongerPro, retirerPro } from "./actions";

type Atelier = {
  id: string;
  nom: string;
  telephone: string;
  ville: string | null;
  created_at: string;
  pro_jusqu_au: string | null;
  pro: boolean;
  commandes_en_cours: number;
  commandes_total: number;
  total_paye: number;
};

const date = (d: string) => format(new Date(d), "d MMM yyyy", { locale: fr });

// Recherche par numéro : c'est ce qu'on voit sur le paiement Wave reçu
export function AdminListe({ ateliers }: { ateliers: Atelier[] }) {
  const [recherche, setRecherche] = useState("");
  const texte = simplifier(recherche.trim());
  const chiffres = recherche.replace(/\D/g, "");
  const filtres = ateliers.filter(
    (a) => !texte || simplifier(a.nom).includes(texte) || (chiffres.length >= 2 && a.telephone.includes(chiffres))
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Numéro ou nom de l'atelier"
          aria-label="Rechercher un atelier"
          className="h-12 pl-10 text-lg"
        />
      </div>
      <ul className="space-y-3">
        {filtres.map((a) => (
          <CarteAtelier key={a.id} atelier={a} />
        ))}
      </ul>
    </div>
  );
}

function CarteAtelier({ atelier: a }: { atelier: Atelier }) {
  // Deux appuis pour activer : un appui de travers offrirait Pro gratuitement
  const [aConfirmer, setAConfirmer] = useState<(typeof FORMULES_PRO)[number] | "retirer" | null>(null);
  const [enCours, startTransition] = useTransition();

  function confirmer() {
    if (!aConfirmer) return;
    startTransition(async () => {
      if (aConfirmer === "retirer") {
        const r = await retirerPro(a.id);
        if (r.erreur) return void toast.error(r.erreur);
        toast.success(`${a.nom} repasse en Gratuit`);
      } else {
        const r = await prolongerPro(a.id, aConfirmer.mois);
        if (r.erreur) return void toast.error(r.erreur);
        toast.success(`${a.nom} : Pro jusqu'au ${date(r.fin!)}`);
      }
      setAConfirmer(null);
    });
  }

  return (
    <li className="rounded-xl border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold">{a.nom}</p>
          <p className="text-sm text-muted-foreground">
            {afficherTelephone(a.telephone)}
            {a.ville ? ` · ${a.ville}` : ""} · inscrit le {date(a.created_at)}
          </p>
        </div>
        {a.pro ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            <Crown className="size-3" /> Pro
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">Gratuit</span>
        )}
      </div>

      <p className="mt-2 text-sm">
        {a.commandes_en_cours} / {a.pro ? "∞" : LIMITE_GRATUIT} en cours · {a.commandes_total} au total
        {a.total_paye > 0 && ` · ${formatFCFA(a.total_paye)} payés`}
      </p>
      {a.pro_jusqu_au && (
        <p className="text-sm text-muted-foreground">
          {a.pro ? "Pro jusqu'au" : "Pro terminé le"} {date(a.pro_jusqu_au)}
        </p>
      )}

      {aConfirmer ? (
        <div className="mt-3 rounded-lg bg-muted p-3">
          <p className="text-sm font-medium">
            {aConfirmer === "retirer"
              ? "Retirer Pro maintenant ? (à faire seulement en cas d'erreur)"
              : `Tu as bien reçu ${formatFCFA(aConfirmer.montant)} par Wave ? Pro + ${aConfirmer.label}.`}
          </p>
          <div className="mt-2 flex gap-2">
            <Button onClick={confirmer} disabled={enCours} className="h-11 flex-1">
              {enCours && <Loader2 className="animate-spin" />}
              Confirmer
            </Button>
            <Button variant="outline" onClick={() => setAConfirmer(null)} disabled={enCours} className="h-11 flex-1">
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {FORMULES_PRO.map((f) => (
            <Button key={f.mois} variant="outline" onClick={() => setAConfirmer(f)} className="h-11">
              + {f.label} · {formatFCFA(f.montant)}
            </Button>
          ))}
          {a.pro && (
            <Button variant="ghost" onClick={() => setAConfirmer("retirer")} className="h-11 text-destructive">
              Retirer Pro
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
