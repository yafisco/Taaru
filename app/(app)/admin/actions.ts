"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FORMULES_PRO } from "@/lib/offre";
import { createClient } from "@/lib/supabase/server";

const ERREUR = "Une erreur est survenue. Vérifie ta connexion et réessaie.";
const erreurDe = (e: { code?: string }) => ({ erreur: e.code === "42501" ? "Accès réservé à l'administration." : ERREUR });

// Le contrôle admin est fait dans la base (fonctions admin_*) : ici on valide seulement les entrées
export async function prolongerPro(atelierId: string, mois: number): Promise<{ erreur?: string; fin?: string }> {
  const formule = FORMULES_PRO.find((f) => f.mois === mois);
  if (!z.uuid().safeParse(atelierId).success || !formule) return { erreur: ERREUR };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_prolonger_pro", {
    p_atelier: atelierId,
    p_mois: formule.mois,
    p_montant: formule.montant,
  });
  if (error) return erreurDe(error);

  revalidatePath("/", "layout");
  return { fin: data };
}

export async function retirerPro(atelierId: string): Promise<{ erreur?: string }> {
  if (!z.uuid().safeParse(atelierId).success) return { erreur: ERREUR };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_retirer_pro", { p_atelier: atelierId });
  if (error) return erreurDe(error);

  revalidatePath("/", "layout");
  return {};
}
