"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ErreurFormulaire } from "@/components/champ";
import { Puce } from "@/components/puce";
import { formatFCFA } from "@/lib/format";
import { ajouterPaiement } from "../actions";
import { lireMontant, MODES_PAIEMENT, paiementSchema, type PaiementValeurs } from "../schemas";

const MONTANTS_RAPIDES = [5_000, 10_000, 25_000];

export function PaiementSheet({ commandeId, reste }: { commandeId: string; reste: number }) {
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState<string>();
  const [enCours, startTransition] = useTransition();
  const {
    register,
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<PaiementValeurs>({
    resolver: zodResolver(paiementSchema),
    defaultValues: { mode: "especes" },
  });
  const [montant, mode] = useWatch({ control, name: ["montant", "mode"] });
  const valeur = Number.isFinite(montant) ? montant : 0;

  const onSubmit = handleSubmit((v) => {
    setErreur(undefined);
    startTransition(async () => {
      const r = await ajouterPaiement(commandeId, v);
      if (r.erreur) return setErreur(r.erreur);
      toast.success(`Paiement de ${formatFCFA(v.montant)} ajouté`);
      setOuvert(false);
    });
  });

  return (
    <Sheet
      open={ouvert}
      onOpenChange={(o) => {
        setOuvert(o);
        if (o) {
          reset({ mode: "especes" });
          setErreur(undefined);
        }
      }}
    >
      <SheetTrigger
        render={
          <Button size="lg" className="h-12 text-base">
            <Plus /> Paiement
          </Button>
        }
      />
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">Nouveau paiement</SheetTitle>
          <p className="text-sm text-muted-foreground">Reste à payer : {formatFCFA(reste)}</p>
        </SheetHeader>

        <form onSubmit={onSubmit} noValidate className="mx-auto w-full max-w-md space-y-5 px-4 pb-6">
          <div className="space-y-2">
            <div className="relative">
              <Input
                inputMode="numeric"
                pattern="[0-9 ]*"
                autoComplete="off"
                placeholder="Montant"
                aria-label="Montant"
                aria-invalid={!!errors.montant}
                className="h-14 pr-16 text-2xl font-semibold"
                {...register("montant", { setValueAs: lireMontant })}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">
                FCFA
              </span>
            </div>
            {errors.montant && <p className="text-sm text-destructive">{errors.montant.message}</p>}
            <div className="flex flex-wrap gap-2">
              {MONTANTS_RAPIDES.filter((m) => m < reste).map((m) => (
                <Puce key={m} actif={valeur === m} onClick={() => setValue("montant", m, { shouldValidate: true })}>
                  {m.toLocaleString("fr-FR")}
                </Puce>
              ))}
              <Puce actif={valeur === reste} onClick={() => setValue("montant", reste, { shouldValidate: true })}>
                Tout le reste
              </Puce>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Mode de paiement">
            {MODES_PAIEMENT.map((p) => (
              <Puce key={p.cle} actif={mode === p.cle} onClick={() => setValue("mode", p.cle)} className="px-2">
                {p.label}
              </Puce>
            ))}
          </div>

          <ErreurFormulaire message={erreur} />

          <Button type="submit" size="lg" disabled={enCours} className="h-12 w-full text-base">
            {enCours && <Loader2 className="animate-spin" />}
            Enregistrer {valeur > 0 ? formatFCFA(valeur) : "le paiement"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
