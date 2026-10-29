"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Enums } from "@/lib/database.types";
import { formatFCFA, ORDRE_STATUTS } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { commandeSchema, paiementSchema, type CommandeValeurs, type PaiementValeurs } from "./schemas";

const ERREUR_RESEAU = "Une erreur est survenue. Vérifie ta connexion et réessaie.";
const DEJA_CHANGE = "La commande a déjà changé. Recharge la page.";

type Statut = Enums<"statut_commande">;
export type ResultatStatut = { erreur: string } | { statut: Statut };

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

/**
 * Fait avancer (sens = 1) ou reculer (sens = -1) le statut d'un cran.
 * `depuis` = statut affiché à l'écran. Si la commande a changé entre-temps (double clic,
 * autre téléphone), la mise à jour ne touche aucune ligne et on prévient le tailleur.
 */
export async function changerStatut(id: string, depuis: Statut, sens: 1 | -1): Promise<ResultatStatut> {
  if (!z.uuid().safeParse(id).success || !z.enum(ORDRE_STATUTS).safeParse(depuis).success) {
    return { erreur: ERREUR_RESEAU };
  }
  const i = ORDRE_STATUTS.indexOf(depuis as (typeof ORDRE_STATUTS)[number]);
  const vers = ORDRE_STATUTS[i + sens];
  if (!vers) return { erreur: DEJA_CHANGE };

  const maintenant = new Date().toISOString();
  const dates =
    sens === 1
      ? vers === "prete"
        ? { pret_le: maintenant }
        : vers === "livree"
          ? { livre_le: maintenant }
          : {}
      : // En reculant, on efface la date de l'étape quittée
        depuis === "prete"
        ? { pret_le: null }
        : depuis === "livree"
          ? { livre_le: null }
          : {};

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("commandes")
    .update({ statut: vers, ...dates })
    .eq("id", id)
    .eq("statut", depuis)
    .select("id");
  if (error) return { erreur: ERREUR_RESEAU };
  if (!data.length) return { erreur: DEJA_CHANGE };

  revalidatePath("/", "layout");
  return { statut: vers };
}

export async function ajouterPaiement(commandeId: string, valeurs: PaiementValeurs): Promise<{ erreur?: string }> {
  const parse = paiementSchema.safeParse(valeurs);
  if (!parse.success) return { erreur: parse.error.issues[0].message };
  if (!z.uuid().safeParse(commandeId).success) return { erreur: ERREUR_RESEAU };

  const supabase = await createClient();
  const { data: c } = await supabase.from("v_commandes").select("reste, statut").eq("id", commandeId).maybeSingle();
  if (!c) return { erreur: "Commande introuvable." };
  if (c.statut === "annulee") return { erreur: "Cette commande est annulée." };
  if (parse.data.montant > (c.reste ?? 0)) {
    return { erreur: `Ce montant dépasse le reste à payer (${formatFCFA(c.reste ?? 0)}).` };
  }

  const { error } = await supabase
    .from("paiements")
    .insert({ commande_id: commandeId, montant: parse.data.montant, mode: parse.data.mode });
  if (error) return { erreur: ERREUR_RESEAU };

  revalidatePath("/", "layout");
  return {};
}
