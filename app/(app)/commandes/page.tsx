import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { cheminMiniature } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";
import { simplifier } from "@/lib/texte";
import { CommandesListe, type CommandeListe, type Onglet } from "./commandes-liste";

export const metadata: Metadata = { title: "Commandes · Taaru" };

export default function CommandesPage({ searchParams }: PageProps<"/commandes">) {
  return (
    <>
      <PageHeader titre="Commandes" />
      <Suspense fallback={<ListeSquelette />}>
        {searchParams.then(({ onglet }) => (
          <Commandes ongletInitial={onglet === "pretes" || onglet === "livrees" ? onglet : "en-cours"} />
        ))}
      </Suspense>
    </>
  );
}

const ONGLET_PAR_STATUT = { recue: "en-cours", coupe: "en-cours", couture: "en-cours", prete: "pretes", livree: "livrees" } as const;

async function Commandes({ ongletInitial }: { ongletInitial: Onglet }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_commandes")
    .select("id, code, modele, client_nom, client_telephone, statut, date_livraison, reste, en_retard, photo_tissu_path, livre_le")
    .neq("statut", "annulee");
  if (error) throw new Error("Impossible de charger les commandes");

  // Miniatures : une seule requête pour toutes les URL signées
  const chemins = data.flatMap((c) => (c.photo_tissu_path ? [cheminMiniature(c.photo_tissu_path)] : []));
  const { data: signees } = chemins.length
    ? await supabase.storage.from("photos").createSignedUrls(chemins, 60 * 60)
    : { data: [] };
  const urlPar = new Map((signees ?? []).flatMap((s) => (s.signedUrl && s.path ? [[s.path, s.signedUrl]] : [])));

  const commandes: (CommandeListe & { livreLe: string | null })[] = data.flatMap((c) =>
    c.id && c.statut && c.statut !== "annulee"
      ? [
          {
            id: c.id,
            code: c.code ?? "",
            modele: c.modele ?? "",
            clientNom: c.client_nom ?? "",
            statut: c.statut,
            dateLivraison: c.date_livraison,
            reste: c.reste ?? 0,
            enRetard: c.en_retard ?? false,
            miniature: c.photo_tissu_path ? (urlPar.get(cheminMiniature(c.photo_tissu_path)) ?? null) : null,
            onglet: ONGLET_PAR_STATUT[c.statut],
            texteRecherche: simplifier([c.client_nom, c.modele, c.code, c.client_telephone].join(" ")),
            livreLe: c.livre_le,
          },
        ]
      : []
  );

  // En retard d'abord, puis la livraison la plus proche. Livrées : la plus récente d'abord.
  commandes.sort((a, b) => {
    if (a.onglet === "livrees" && b.onglet === "livrees") return (b.livreLe ?? "").localeCompare(a.livreLe ?? "");
    if (a.enRetard !== b.enRetard) return a.enRetard ? -1 : 1;
    return (a.dateLivraison ?? "9999").localeCompare(b.dateLivraison ?? "9999");
  });

  return <CommandesListe commandes={commandes} ongletInitial={ongletInitial} />;
}

function ListeSquelette() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-12 w-full" />
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}
