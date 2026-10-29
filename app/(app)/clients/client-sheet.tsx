"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Champ, ErreurFormulaire } from "@/components/champ";
import { cn } from "@/lib/utils";
import { creerClient, modifierClient } from "./actions";
import { clientSchema, type ClientValeurs } from "./schemas";

type Props = {
  /** Absent = création. Présent = modification de ce client. */
  client?: { id: string } & ClientValeurs;
  declencheur: React.ReactElement;
};

const VIDE: ClientValeurs = { nom: "", telephone: "", quartier: "", genre: null };

export function ClientSheet({ client, declencheur }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState<string>();
  const [enCours, startTransition] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientValeurs>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ?? VIDE,
  });

  const onSubmit = handleSubmit((valeurs) => {
    setErreur(undefined);
    startTransition(async () => {
      // En création, l'action redirige vers la fiche du nouveau client
      const resultat = client ? await modifierClient(client.id, valeurs) : await creerClient(valeurs);
      if (resultat.erreur) return setErreur(resultat.erreur);
      toast.success("Client enregistré");
      setOuvert(false);
    });
  });

  return (
    <Sheet
      open={ouvert}
      onOpenChange={(o) => {
        setOuvert(o);
        if (o) {
          reset(client ?? VIDE);
          setErreur(undefined);
        }
      }}
    >
      <SheetTrigger render={declencheur} />
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">{client ? "Modifier le client" : "Nouveau client"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={onSubmit} noValidate className="mx-auto w-full max-w-md space-y-5 px-4 pb-6">
          <Champ id="nom" label="Nom" erreur={errors.nom?.message}>
            <Input
              id="nom"
              placeholder="Moussa Diop"
              autoComplete="off"
              aria-invalid={!!errors.nom}
              className="h-12 text-lg"
              {...register("nom")}
            />
          </Champ>

          <Champ id="telephone" label="Téléphone" erreur={errors.telephone?.message} aide="Pour le prévenir sur WhatsApp.">
            <Input
              id="telephone"
              type="tel"
              inputMode="tel"
              placeholder="77 123 45 67"
              autoComplete="off"
              aria-invalid={!!errors.telephone}
              className="h-12 text-lg"
              {...register("telephone")}
            />
          </Champ>

          <Controller
            control={control}
            name="genre"
            render={({ field }) => (
              <fieldset className="space-y-2">
                <legend className="text-base font-medium">Genre</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(["homme", "femme"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={field.value === g}
                      onClick={() => field.onChange(field.value === g ? null : g)}
                      className={cn(
                        "h-12 rounded-lg border text-base font-medium capitalize",
                        field.value === g ? "border-primary bg-primary text-primary-foreground" : "bg-background"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          />

          <Champ id="quartier" label="Quartier (facultatif)" erreur={errors.quartier?.message}>
            <Input
              id="quartier"
              placeholder="Randoulène"
              autoComplete="off"
              aria-invalid={!!errors.quartier}
              className="h-12 text-lg"
              {...register("quartier")}
            />
          </Champ>

          <ErreurFormulaire message={erreur} />

          <Button type="submit" size="lg" disabled={enCours} className="h-12 w-full text-base">
            {enCours && <Loader2 className="animate-spin" />}
            Enregistrer
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
