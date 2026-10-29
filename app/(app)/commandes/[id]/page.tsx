import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { StatutBadge } from "@/components/statut-badge";
import { ToastAuChargement } from "@/components/toast-au-chargement";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { formatDate, formatFCFA } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { lienWhatsApp, type Langue } from "@/lib/whatsapp";

// Première version (étape 4) : complétée à l'étape 5 (paiements, statuts, etc.)
export default function FicheCommandePage({ params, searchParams }: PageProps<"/commandes/[id]">) {
  return (
    <Suspense fallback={<FicheSquelette />}>
      {Promise.all([params, searchParams]).then(([{ id }, { nouvelle }]) => (
        <FicheCommande id={id} nouvelle={nouvelle === "1"} />
      ))}
    </Suspense>
  );
}

async function FicheCommande({ id, nouvelle }: { id: string; nouvelle: boolean }) {
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const [{ data: c }, { data: atelier }] = await Promise.all([
    supabase.from("v_commandes").select("*").eq("id", id).maybeSingle(),
    supabase.from("ateliers").select("nom, langue_messages").maybeSingle(),
  ]);
  if (!c || !c.id || !atelier) notFound();

  const photo = c.photo_tissu_path
    ? (await supabase.storage.from("photos").createSignedUrl(c.photo_tissu_path, 60 * 60)).data?.signedUrl
    : null;

  const lienRecu =
    c.client_telephone &&
    lienWhatsApp(c.client_telephone, "recu", atelier.langue_messages as Langue, {
      client: c.client_nom ?? "",
      modele: c.modele ?? "",
      atelier: atelier.nom,
      reste: c.reste ?? 0,
      code: c.code ?? "",
      date: c.date_livraison ? formatDate(c.date_livraison) : "à confirmer",
    });

  return (
    <>
      {nouvelle && <ToastAuChargement message="Commande enregistrée" />}
      <PageHeader titre={c.modele ?? "Commande"} retour={{ href: "/commandes", label: "Commandes" }} />

      {nouvelle && lienRecu && (
        <div className="mb-6 space-y-3 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 p-4">
          <p className="font-medium">Envoie le reçu à {c.client_nom} : numéro de commande, date et reste à payer.</p>
          <WhatsAppButton href={lienRecu} className="w-full">
            Envoyer le reçu
          </WhatsAppButton>
        </div>
      )}

      {photo && (
        // eslint-disable-next-line @next/next/no-img-element -- URL signée temporaire du bucket privé
        <img src={photo} alt={`Tissu de ${c.modele}`} className="mb-4 h-64 w-full rounded-xl border object-cover" />
      )}

      <div className="space-y-3 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold">{c.client_nom}</p>
          {c.statut && <StatutBadge statut={c.statut} />}
        </div>
        <p className="text-sm text-muted-foreground">Commande n°{c.code}</p>
        {c.date_livraison && (
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4" /> Livraison : {formatDate(c.date_livraison)}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2 border-t pt-3 text-sm">
          <span>Prix</span>
          <span className="text-right font-medium">{formatFCFA(c.prix_total ?? 0)}</span>
          <span>Déjà payé</span>
          <span className="text-right font-medium">{formatFCFA(c.total_paye ?? 0)}</span>
          <span className="text-base font-semibold">Reste à payer</span>
          <span className="text-right text-base font-bold">{formatFCFA(c.reste ?? 0)}</span>
        </div>
      </div>
    </>
  );
}

function FicheSquelette() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
