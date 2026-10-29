import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { formatFCFA } from "@/lib/format";
import { estPro } from "@/lib/offre";
import { createClient } from "@/lib/supabase/server";
import { AdminListe } from "./admin-liste";

export const metadata: Metadata = { title: "Administration · Taaru" };

export default function AdminPage() {
  return (
    <>
      <PageHeader titre="Administration" retour={{ href: "/reglages", label: "Réglages" }} />
      <Suspense fallback={<AdminSquelette />}>
        <Admin />
      </Suspense>
    </>
  );
}

async function Admin() {
  const supabase = await createClient();
  // Pour un non-admin, la page n'existe pas (et la base refuse de toute façon)
  const { data: admin } = await supabase.rpc("est_admin");
  if (!admin) notFound();

  const { data: ateliers, error } = await supabase.rpc("admin_ateliers");
  if (error) throw new Error("Impossible de charger les ateliers");

  const liste = ateliers.map((a) => ({ ...a, pro: estPro(a.pro_jusqu_au) }));
  const encaisse = liste.reduce((s, a) => s + a.total_paye, 0);

  return (
    <>
      <section className="mb-5 grid grid-cols-3 gap-2 text-center">
        <Chiffre valeur={String(liste.length)} label="Ateliers" />
        <Chiffre valeur={String(liste.filter((a) => a.pro).length)} label="Pro actifs" />
        <Chiffre valeur={formatFCFA(encaisse)} label="Encaissé" />
      </section>
      <AdminListe ateliers={liste} />
    </>
  );
}

function Chiffre({ valeur, label }: { valeur: string; label: string }) {
  return (
    <div className="rounded-xl border p-3">
      <p className="truncate text-lg font-bold">{valeur}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function AdminSquelette() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-12 w-full" />
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-36 w-full" />
      ))}
    </div>
  );
}
