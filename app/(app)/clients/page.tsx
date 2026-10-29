import { Suspense } from "react";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import { ClientSheet } from "./client-sheet";
import { ClientsListe } from "./clients-liste";

export const metadata: Metadata = { title: "Clients · Taaru" };

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        titre="Clients"
        action={
          <ClientSheet
            declencheur={
              <Button size="lg" variant="outline" className="h-11">
                <Plus />
                Ajouter
              </Button>
            }
          />
        }
      />
      {/* Lit les cookies (session) : doit être dans un Suspense avec Cache Components */}
      <Suspense fallback={<ListeSquelette />}>
        <Clients />
      </Suspense>
    </>
  );
}

async function Clients() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clients").select("id, nom, telephone, quartier").order("nom");
  if (error) throw new Error("Impossible de charger les clients");
  return <ClientsListe clients={data} />;
}

function ListeSquelette() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
