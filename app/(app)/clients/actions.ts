"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Json } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { normaliserTelephone } from "@/lib/whatsapp";
import { clientSchema, lireMesure, mesuresSchema, type ClientValeurs, type MesuresValeurs } from "./schemas";

export type Resultat = { erreur?: string; ok?: boolean };

const idSchema = z.uuid();
const ERREUR_RESEAU = "Une erreur est survenue. Vérifie ta connexion et réessaie.";

// atelier_id n'est jamais envoyé : la colonne vaut auth.uid() par défaut et la RLS vérifie.
function versLigne(v: ClientValeurs) {
  return {
    nom: v.nom,
    telephone: v.telephone ? normaliserTelephone(v.telephone) : null,
    quartier: v.quartier || null,
    genre: v.genre,
  };
}

export async function creerClient(valeurs: ClientValeurs): Promise<Resultat> {
  const parse = clientSchema.safeParse(valeurs);
  if (!parse.success) return { erreur: parse.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.from("clients").insert(versLigne(parse.data)).select("id").single();
  if (error) return { erreur: error.code === "23505" ? "Tu as déjà un client avec ce numéro." : ERREUR_RESEAU };

  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
}

export type ClientRapide = { id: string; nom: string; telephone: string | null };

// Création depuis « Nouvelle commande » : pas de redirection, on renvoie le client à sélectionner.
// Si le numéro existe déjà, on renvoie le client existant au lieu d'une erreur.
export async function creerClientRapide(nom: string, telephone: string): Promise<Resultat & { client?: ClientRapide }> {
  const parse = clientSchema.safeParse({ nom, telephone, quartier: "", genre: null });
  if (!parse.success) return { erreur: parse.error.issues[0].message };
  const ligne = versLigne(parse.data);

  const supabase = await createClient();
  const { data, error } = await supabase.from("clients").insert(ligne).select("id, nom, telephone").single();
  if (!error) {
    revalidatePath("/clients");
    return { client: data };
  }
  if (error.code !== "23505" || !ligne.telephone) return { erreur: ERREUR_RESEAU };

  const { data: existant } = await supabase
    .from("clients")
    .select("id, nom, telephone")
    .eq("telephone", ligne.telephone)
    .maybeSingle();
  return existant ? { client: existant } : { erreur: ERREUR_RESEAU };
}

export async function modifierClient(id: string, valeurs: ClientValeurs): Promise<Resultat> {
  const parse = clientSchema.safeParse(valeurs);
  if (!parse.success || !idSchema.safeParse(id).success) {
    return { erreur: parse.error?.issues[0].message ?? "Client introuvable." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("clients").update(versLigne(parse.data)).eq("id", id).select("id");
  if (error) return { erreur: error.code === "23505" ? "Tu as déjà un client avec ce numéro." : ERREUR_RESEAU };
  if (!data.length) return { erreur: "Client introuvable." };

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  return { ok: true };
}

export async function enregistrerMesures(clientId: string, valeurs: MesuresValeurs): Promise<Resultat> {
  const parse = mesuresSchema.safeParse(valeurs);
  if (!parse.success || !idSchema.safeParse(clientId).success) {
    return { erreur: parse.error?.issues[0].message ?? "Client introuvable." };
  }
  const { genre, remarques } = parse.data;

  const supabase = await createClient();

  // Met à jour le genre et vérifie au passage que le client appartient à l'atelier (RLS)
  const { data: client, error: errClient } = await supabase
    .from("clients")
    .update({ genre })
    .eq("id", clientId)
    .select("id");
  if (errClient) return { erreur: ERREUR_RESEAU };
  if (!client.length) return { erreur: "Client introuvable." };

  // On fusionne avec la fiche existante : les mesures de l'autre genre ne sont pas perdues
  const { data: existant } = await supabase.from("mesures").select("valeurs").eq("client_id", clientId).maybeSingle();
  const fusion: Record<string, Json> = { ...(existant?.valeurs as Record<string, Json> | null) };
  for (const [cle, brut] of Object.entries(parse.data.valeurs)) {
    const n = lireMesure(brut);
    if (n == null) delete fusion[cle];
    else fusion[cle] = n;
  }

  const { error } = await supabase
    .from("mesures")
    .upsert({ client_id: clientId, valeurs: fusion, remarques: remarques || null }, { onConflict: "client_id" });
  if (error) return { erreur: ERREUR_RESEAU };

  revalidatePath(`/clients/${clientId}`);
  return { ok: true };
}
