import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { deconnecter } from "@/app/(auth)/actions";
import { cleDeFete } from "@/lib/fete";
import { createClient } from "@/lib/supabase/server";
import { afficherTelephone } from "@/lib/whatsapp";
import { ReglagesForm } from "./reglages-form";

export const metadata: Metadata = { title: "Réglages · Taaru" };

export default function ReglagesPage() {
  return (
    <>
      <PageHeader titre="Réglages" />
      <Suspense fallback={<ReglagesSquelette />}>
        <Reglages />
      </Suspense>
      <form action={deconnecter} className="mt-10 border-t pt-6">
        <Button type="submit" variant="outline" size="lg" className="h-12 w-full text-base">
          <LogOut />
          Se déconnecter
        </Button>
      </form>
    </>
  );
}

async function Reglages() {
  const supabase = await createClient();
  const { data: a } = await supabase
    .from("ateliers")
    .select("nom, telephone, langue_messages, capacite_semaine, fete_nom, fete_date")
    .maybeSingle();
  if (!a) redirect("/connexion");

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground">
        Compte : {afficherTelephone(a.telephone)} (numéro de connexion, non modifiable)
      </p>
      <ReglagesForm
        valeurs={{
          nom: a.nom,
          langue: a.langue_messages === "wo" ? "wo" : "fr",
          capacite: a.capacite_semaine,
          fete: cleDeFete(a.fete_nom),
          feteDate: a.fete_date ?? "",
        }}
      />
    </>
  );
}

function ReglagesSquelette() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-32" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
