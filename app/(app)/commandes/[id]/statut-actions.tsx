"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WhatsAppButton } from "@/components/whatsapp-button";
import type { Enums } from "@/lib/database.types";
import { formatFCFA, ORDRE_STATUTS, STATUTS } from "@/lib/format";
import { cn } from "@/lib/utils";
import { annulerCommande, changerStatut, reactiverCommande } from "../actions";

type Statut = Enums<"statut_commande">;

type Props = {
  commandeId: string;
  statut: Statut;
  reste: number;
  modele: string;
  clientNom: string;
  /** Lien wa.me « C'est prêt », null si le client n'a pas de numéro */
  lienPret: string | null;
};

export function StatutActions({ commandeId, statut, reste, modele, clientNom, lienPret }: Props) {
  const [enCours, startTransition] = useTransition();
  const [dialogPret, setDialogPret] = useState(false);
  const [confirmerLivraison, setConfirmerLivraison] = useState(false);

  if (statut === "annulee") {
    return (
      <div className="space-y-3">
        <p className="rounded-lg bg-red-50 px-4 py-3 font-medium text-red-700">Cette commande est annulée.</p>
        <Button
          variant="outline"
          size="lg"
          disabled={enCours}
          className="h-12 w-full text-base"
          onClick={() =>
            startTransition(async () => {
              const r = await reactiverCommande(commandeId);
              if ("erreur" in r) toast.error(r.erreur);
              else toast.success("Commande réactivée : elle repart de « Reçue »");
            })
          }
        >
          {enCours ? <Loader2 className="animate-spin" /> : <Undo2 />}
          Réactiver la commande
        </Button>
      </div>
    );
  }

  const index = ORDRE_STATUTS.indexOf(statut);
  const suivant = ORDRE_STATUTS[index + 1];
  const precedent = ORDRE_STATUTS[index - 1];

  function changer(sens: 1 | -1) {
    setConfirmerLivraison(false);
    startTransition(async () => {
      const r = await changerStatut(commandeId, statut, sens);
      if ("erreur" in r) return void toast.error(r.erreur);
      if (r.statut === "prete") setDialogPret(true);
      else toast.success(`Statut : ${STATUTS[r.statut].label}`);
    });
  }

  function avancer() {
    // Livrer alors que tout n'est pas payé : on demande confirmation
    if (suivant === "livree" && reste > 0) setConfirmerLivraison(true);
    else changer(1);
  }

  return (
    <div className="space-y-4">
      <ol className="flex items-start" aria-label="Avancement de la commande">
        {ORDRE_STATUTS.map((s, i) => {
          const fait = i < index;
          const actuel = i === index;
          return (
            <li key={s} className="flex flex-1 flex-col items-center gap-1.5" aria-current={actuel ? "step" : undefined}>
              <div className="flex w-full items-center">
                <span className={cn("h-0.5 flex-1", i === 0 ? "invisible" : i <= index ? "bg-primary" : "bg-border")} />
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                    fait && "border-primary bg-primary text-primary-foreground",
                    actuel && "border-primary bg-background text-primary ring-4 ring-primary/15",
                    !fait && !actuel && "border-border text-muted-foreground"
                  )}
                >
                  {fait ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    i === ORDRE_STATUTS.length - 1 ? "invisible" : i < index ? "bg-primary" : "bg-border"
                  )}
                />
              </div>
              <span className={cn("text-xs", actuel ? "font-semibold text-primary" : "text-muted-foreground")}>
                {STATUTS[s].label}
              </span>
            </li>
          );
        })}
      </ol>

      {statut === "prete" && lienPret && (
        <WhatsAppButton href={lienPret} className="w-full">
          Prévenir que c&apos;est prêt
        </WhatsAppButton>
      )}

      {suivant && !confirmerLivraison && (
        <Button size="lg" disabled={enCours} onClick={avancer} className="h-12 w-full text-base">
          {enCours && <Loader2 className="animate-spin" />}
          {suivant === "livree" ? "Marquer livrée" : `Étape suivante : ${STATUTS[suivant].label}`}
        </Button>
      )}

      {confirmerLivraison && (
        <div role="alert" className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="font-medium text-amber-900">
            Il reste {formatFCFA(reste)} à payer. Marquer livrée quand même ?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="lg" className="h-12" onClick={() => setConfirmerLivraison(false)}>
              Annuler
            </Button>
            <Button size="lg" className="h-12" disabled={enCours} onClick={() => changer(1)}>
              {enCours && <Loader2 className="animate-spin" />}
              Oui, livrée
            </Button>
          </div>
        </div>
      )}

      {precedent && (
        <button
          type="button"
          disabled={enCours}
          onClick={() => changer(-1)}
          className="mx-auto flex h-10 items-center gap-1.5 text-sm text-muted-foreground"
        >
          <Undo2 className="size-4" /> Revenir à « {STATUTS[precedent].label} »
        </button>
      )}

      <Dialog open={dialogPret} onOpenChange={setDialogPret}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg">C&apos;est prêt ! 🎉</DialogTitle>
            <DialogDescription className="text-base">
              {lienPret
                ? `Préviens ${clientNom} que son ${modele.toLowerCase()} est prêt.`
                : `Ajoute le numéro de ${clientNom} sur sa fiche pour le prévenir sur WhatsApp.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            {lienPret && (
              <WhatsAppButton href={lienPret} className="w-full">
                Prévenir sur WhatsApp
              </WhatsAppButton>
            )}
            <Button variant="ghost" size="lg" className="h-12 w-full" onClick={() => setDialogPret(false)}>
              Plus tard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Bouton discret en bas de fiche, avec confirmation. Pas proposé pour une commande livrée.
export function AnnulerCommande({ commandeId, totalPaye }: { commandeId: string; totalPaye: number }) {
  const [ouvert, setOuvert] = useState(false);
  const [enCours, startTransition] = useTransition();

  function annuler() {
    startTransition(async () => {
      const r = await annulerCommande(commandeId);
      if ("erreur" in r) return void toast.error(r.erreur);
      toast.success("Commande annulée");
      setOuvert(false);
    });
  }

  return (
    <>
      <Button variant="ghost" className="mx-auto mt-6 flex h-11 text-destructive" onClick={() => setOuvert(true)}>
        Annuler la commande
      </Button>
      <Dialog open={ouvert} onOpenChange={setOuvert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg">Annuler cette commande ?</DialogTitle>
            <DialogDescription className="text-base">
              {totalPaye > 0
                ? `Le client a déjà versé ${formatFCFA(totalPaye)}. Si tu le rembourses, supprime aussi ses paiements.`
                : "Elle ne comptera plus dans tes commandes en cours. Tu pourras la réactiver."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button variant="destructive" size="lg" className="h-12 w-full" disabled={enCours} onClick={annuler}>
              {enCours && <Loader2 className="animate-spin" />}
              Oui, annuler la commande
            </Button>
            <Button variant="ghost" size="lg" className="h-12 w-full" onClick={() => setOuvert(false)}>
              Non, garder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
