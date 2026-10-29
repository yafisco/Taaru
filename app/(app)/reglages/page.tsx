import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Crown, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { deconnecter } from "@/app/(auth)/actions";
import { cleDeFete } from "@/lib/fete";
import { LIMITE_GRATUIT, lireOffre } from "@/lib/offre";
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
  const [{ data: a }, offre, { data: admin }] = await Promise.all([
    supabase.from("ateliers").select("nom, telephone, langue_messages, capacite_semaine, fete_nom, fete_date").maybeSingle(),
    lireOffre(supabase),
    supabase.rpc("est_admin"),
  ]);
  if (!a || !offre) redirect("/connexion");

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        Compte : {afficherTelephone(a.telephone)} (numéro de connexion, non modifiable)
      </p>
      <LienReglage href="/pro" icone={Crown}>
        {offre.pro ? "Offre Pro" : `Offre Gratuit · ${offre.enCours} / ${LIMITE_GRATUIT} commandes · Passer à Pro`}
      </LienReglage>
      {admin && (
        <LienReglage href="/admin" icone={ShieldCheck}>
          Administration Taaru
        </LienReglage>
      )}
      <div className="mb-6" />
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

function LienReglage({ href, icone: Icone, children }: { href: string; icone: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <Link href={href} className="mb-3 flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 font-medium active:bg-muted">
      <Icone className="size-5 shrink-0 text-amber-700" />
      <span className="flex-1">{children}</span>
      <ChevronRight className="size-5 text-muted-foreground" />
    </Link>
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
