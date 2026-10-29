import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import { NouvelleCommandeForm } from "./nouvelle-commande-form";

export const metadata: Metadata = { title: "Nouvelle commande · Taaru" };

export default function NouvelleCommandePage({ searchParams }: PageProps<"/commandes/nouvelle">) {
  return (
    <>
      <PageHeader titre="Nouvelle commande" retour={{ href: "/commandes", label: "Commandes" }} />
      <Suspense fallback={<FormulaireSquelette />}>
        {searchParams.then(({ client }) => (
          <Formulaire clientId={typeof client === "string" ? client : null} />
        ))}
      </Suspense>
    </>
  );
}

async function Formulaire({ clientId }: { clientId: string | null }) {
  const supabase = await createClient();
  const [{ data: auth }, { data: clients, error }] = await Promise.all([
    supabase.auth.getClaims(),
    // Les plus récents d'abord : ce sont souvent eux qu'on cherche
    supabase.from("clients").select("id, nom, telephone").order("created_at", { ascending: false }),
  ]);
  if (!auth?.claims) redirect("/connexion");
  if (error) throw new Error("Impossible de charger les clients");

  return (
    <NouvelleCommandeForm
      atelierId={auth.claims.sub}
      clients={clients}
      clientInitial={clients.find((c) => c.id === clientId) ?? null}
    />
  );
}

function FormulaireSquelette() {
  return (
    <div className="space-y-7">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
