"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FETES } from "@/lib/fete";
import { createClient } from "@/lib/supabase/server";
import { reglagesSchema, type ReglagesValeurs } from "./schemas";

export async function modifierReglages(valeurs: ReglagesValeurs): Promise<{ erreur?: string }> {
  const parse = reglagesSchema.safeParse(valeurs);
  if (!parse.success) return { erreur: parse.error.issues[0].message };
  const v = parse.data;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/connexion");

  const { error } = await supabase
    .from("ateliers")
    .update({
      nom: v.nom,
      langue_messages: v.langue,
      capacite_semaine: v.capacite,
      fete_nom: FETES.find((f) => f.cle === v.fete)?.label ?? null,
      fete_date: v.fete ? v.feteDate : null,
    })
    .eq("id", auth.claims.sub);
  if (error) return { erreur: "Une erreur est survenue. Vérifie ta connexion et réessaie." };

  revalidatePath("/", "layout");
  return {};
}
