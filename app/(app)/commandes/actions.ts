"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { commandeSchema, type CommandeValeurs } from "./schemas";

const ERREUR_RESEAU = "Une erreur est survenue. Vérifie ta connexion et réessaie.";

/**
 * L'id est généré par le navigateur à l'ouverture du formulaire : la photo est déjà
 * envoyée dans photos/{atelier_id}/{id}/tissu.jpg avant même qu'on clique « Enregistrer ».
 * Bonus : un double clic renvoie le même id, donc pas de commande en double.
 */
export async function creerCommande(
  id: string,
  photoPath: string | null,
  valeurs: CommandeValeurs
): Promise<{ erreur: string } | undefined> {
  const parse = commandeSchema.safeParse(valeurs);
  if (!parse.success) return { erreur: parse.error.issues[0].message };
  if (!z.uuid().safeParse(id).success) return { erreur: ERREUR_RESEAU };
  const v = parse.data;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const atelierId = auth?.claims.sub;
  if (!atelierId) redirect("/connexion");

  // Le chemin de la photo ne peut pas pointer ailleurs que dans le dossier de cette commande
  if (photoPath !== null && photoPath !== `${atelierId}/${id}/tissu.jpg`) return { erreur: ERREUR_RESEAU };

  // Le client doit appartenir à l'atelier (la RLS filtre les autres)
  const { data: client } = await supabase.from("clients").select("id").eq("id", v.clientId).maybeSingle();
  if (!client) return { erreur: "Client introuvable. Choisis-le à nouveau." };

  const { error } = await supabase.from("commandes").insert({
    id,
    client_id: v.clientId,
    modele: v.modele,
    prix_total: v.prixTotal,
    date_livraison: v.dateLivraison,
    evenement: v.evenement,
    photo_tissu_path: photoPath,
  });
  // 23505 = id déjà utilisé : la commande a déjà été créée (double clic), on y va
  if (error && error.code !== "23505") return { erreur: ERREUR_RESEAU };

  if (!error && v.acompte > 0) {
    const { error: errPaiement } = await supabase
      .from("paiements")
      .insert({ commande_id: id, montant: v.acompte, mode: v.mode });
    if (errPaiement) {
      // Pas de commande sans son acompte : on annule pour que le tailleur réessaie proprement
      await supabase.from("commandes").delete().eq("id", id);
      return { erreur: ERREUR_RESEAU };
    }
  }

  revalidatePath("/commandes");
  revalidatePath(`/clients/${v.clientId}`);
  redirect(`/commandes/${id}?nouvelle=1`);
}
