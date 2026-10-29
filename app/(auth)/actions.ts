"use server";

import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { normaliserTelephone } from "@/lib/whatsapp";
import {
  connexionSchema,
  emailTechnique,
  inscriptionSchema,
  type ConnexionValeurs,
  type InscriptionValeurs,
} from "./schemas";

export type EtatAuth = { erreur: string } | undefined;

export async function inscrire(valeurs: InscriptionValeurs): Promise<EtatAuth> {
  // On revalide côté serveur : ne jamais faire confiance au client
  const parse = inscriptionSchema.safeParse(valeurs);
  if (!parse.success) return { erreur: parse.error.issues[0].message };

  const { nomAtelier, pin } = parse.data;
  const tel = normaliserTelephone(parse.data.telephone)!;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: emailTechnique(tel),
    password: pin,
    // Lu par le trigger handle_new_user pour créer l'atelier
    options: { data: { nom_atelier: nomAtelier, telephone: tel } },
  });
  if (error) return { erreur: messageErreur(error) };

  redirect("/");
}

export async function connecter(valeurs: ConnexionValeurs): Promise<EtatAuth> {
  const parse = connexionSchema.safeParse(valeurs);
  if (!parse.success) return { erreur: parse.error.issues[0].message };

  const tel = normaliserTelephone(parse.data.telephone)!;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: emailTechnique(tel),
    password: parse.data.pin,
  });
  if (error) return { erreur: messageErreur(error) };

  redirect("/");
}

export async function deconnecter() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}

function messageErreur(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Numéro ou code PIN incorrect.";
    case "user_already_exists":
    case "email_exists":
      return "Ce numéro a déjà un compte. Connecte-toi.";
    case "weak_password":
      return "Choisis un autre code PIN (évite 123456 ou 000000).";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Trop d'essais. Attends une minute puis réessaie.";
    default:
      console.error("[auth]", error.code, error.message);
      return "Une erreur est survenue. Vérifie ta connexion et réessaie.";
  }
}
