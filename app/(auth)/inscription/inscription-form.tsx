"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PinInput } from "@/components/pin-input";
import { inscrire } from "../actions";
import { Champ, ErreurFormulaire } from "@/components/champ";
import { inscriptionSchema, type InscriptionValeurs } from "../schemas";

export function InscriptionForm() {
  const [erreur, setErreur] = useState<string>();
  const [enCours, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InscriptionValeurs>({
    resolver: zodResolver(inscriptionSchema),
    defaultValues: { nomAtelier: "", telephone: "", pin: "" },
  });

  const onSubmit = handleSubmit((valeurs) => {
    setErreur(undefined);
    startTransition(async () => {
      const resultat = await inscrire(valeurs);
      if (resultat?.erreur) setErreur(resultat.erreur);
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Champ id="nomAtelier" label="Nom de ton atelier" erreur={errors.nomAtelier?.message}>
        <Input
          id="nomAtelier"
          placeholder="Atelier Ndiaye Couture"
          autoComplete="organization"
          aria-invalid={!!errors.nomAtelier}
          className="h-12 text-lg"
          {...register("nomAtelier")}
        />
      </Champ>

      <Champ id="telephone" label="Ton numéro de téléphone" erreur={errors.telephone?.message}>
        <Input
          id="telephone"
          type="tel"
          inputMode="tel"
          placeholder="77 123 45 67"
          autoComplete="tel"
          aria-invalid={!!errors.telephone}
          className="h-12 text-lg"
          {...register("telephone")}
        />
      </Champ>

      <Champ
        id="pin"
        label="Choisis un code PIN"
        erreur={errors.pin?.message}
        aide="6 chiffres. Tu l'utiliseras pour te connecter."
      >
        <PinInput id="pin" autoComplete="new-password" aria-invalid={!!errors.pin} {...register("pin")} />
      </Champ>

      <ErreurFormulaire message={erreur} />

      <Button type="submit" size="lg" disabled={enCours} className="h-12 w-full text-base">
        {enCours && <Loader2 className="animate-spin" />}
        Créer mon atelier
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-medium text-primary underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
