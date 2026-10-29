import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, PartyPopper } from "lucide-react";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { DelaiBadge } from "@/components/delai-badge";
import { PageHeader } from "@/components/page-header";
import { StatutBadge } from "@/components/statut-badge";
import { ToastAuChargement } from "@/components/toast-au-chargement";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { formatDate, formatFCFA } from "@/lib/format";
import { EVENEMENTS } from "@/lib/mesures";
import { createClient } from "@/lib/supabase/server";
import { afficherTelephone, lienWhatsApp, type Langue } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { MODES_PAIEMENT } from "../schemas";
import { PaiementSheet } from "./paiement-sheet";
import { StatutActions } from "./statut-actions";

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
  const [{ data: c }, { data: atelier }, { data: paiements }] = await Promise.all([
    supabase.from("v_commandes").select("*").eq("id", id).maybeSingle(),
    supabase.from("ateliers").select("nom, langue_messages").maybeSingle(),
    supabase.from("paiements").select("id, montant, mode, paye_le").eq("commande_id", id).order("paye_le"),
  ]);
  if (!c?.id || !c.statut || !atelier) notFound();

  const photo = c.photo_tissu_path
    ? (await supabase.storage.from("photos").createSignedUrl(c.photo_tissu_path, 60 * 60)).data?.signedUrl
    : null;

  const reste = c.reste ?? 0;
  const modele = c.modele ?? "Commande";
  const clientNom = c.client_nom ?? "";
  const langue = (atelier.langue_messages === "wo" ? "wo" : "fr") satisfies Langue;
  const varsMessage = {
    client: clientNom,
    modele,
    atelier: atelier.nom,
    reste,
    code: c.code ?? "",
    date: c.date_livraison ? formatDate(c.date_livraison) : "à confirmer",
  };
  const lien = (type: "recu" | "pret" | "relance") =>
    c.client_telephone ? lienWhatsApp(c.client_telephone, type, langue, varsMessage) : null;
  const enCours = !["prete", "livree", "annulee"].includes(c.statut);
  const evenement = EVENEMENTS.find((e) => e.cle === c.evenement)?.label;

  return (
    <>
      {nouvelle && <ToastAuChargement message="Commande enregistrée" />}
      <PageHeader titre={modele} retour={{ href: "/commandes", label: "Commandes" }} action={<StatutBadge statut={c.statut} />} />

      {nouvelle && lien("recu") && (
        <div className="mb-5 space-y-3 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 p-4">
          <p className="font-medium">Envoie le reçu à {clientNom} : numéro de commande, date et reste à payer.</p>
          <WhatsAppButton href={lien("recu")!} className="w-full">
            Envoyer le reçu
          </WhatsAppButton>
        </div>
      )}

      {photo && (
        <a href={photo} target="_blank" rel="noopener noreferrer" className="mb-5 block">
          {/* eslint-disable-next-line @next/next/no-img-element -- URL signée temporaire du bucket privé */}
          <img src={photo} alt={`Tissu : ${modele}`} className="h-72 w-full rounded-xl border object-cover" />
        </a>
      )}

      {/* Client + livraison */}
      <section className="mb-5 divide-y rounded-xl border">
        <Link href={`/clients/${c.client_id}`} className="flex items-center gap-3 px-4 py-3 active:bg-muted">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{clientNom}</p>
            <p className="text-sm text-muted-foreground">
              {c.client_telephone ? afficherTelephone(c.client_telephone) : "Pas de numéro"} · n°{c.code}
            </p>
          </div>
          <ChevronRight className="size-5 text-muted-foreground" />
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
          <CalendarDays className="size-5 text-muted-foreground" />
          <span className="font-medium">{c.date_livraison ? formatDate(c.date_livraison) : "Date à fixer"}</span>
          {c.date_livraison && enCours && <DelaiBadge date={c.date_livraison} />}
          {evenement && (
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <PartyPopper className="size-4" /> {evenement}
            </span>
          )}
        </div>
      </section>

      {/* Statuts */}
      <section className="mb-5 rounded-xl border p-4">
        <StatutActions
          commandeId={c.id}
          statut={c.statut}
          reste={reste}
          modele={modele}
          clientNom={clientNom}
          lienPret={lien("pret")}
        />
      </section>

      {/* Argent */}
      <section className="rounded-xl border p-4">
        <div className="grid grid-cols-2 gap-y-1 text-sm">
          <span className="text-muted-foreground">Prix</span>
          <span className="text-right font-medium">{formatFCFA(c.prix_total ?? 0)}</span>
          <span className="text-muted-foreground">Déjà payé</span>
          <span className="text-right font-medium">{formatFCFA(c.total_paye ?? 0)}</span>
        </div>

        <div
          className={cn(
            "my-4 rounded-lg px-4 py-3 text-center",
            reste > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
          )}
        >
          {reste > 0 ? (
            <>
              <p className="text-sm font-semibold tracking-wide uppercase">Reste à payer</p>
              <p className="text-3xl font-bold">{formatFCFA(reste)}</p>
            </>
          ) : (
            <p className="text-lg font-bold">Tout est payé ✓</p>
          )}
        </div>

        {reste > 0 && c.statut !== "annulee" && (
          <div className={cn("mb-4 grid gap-2", lien("relance") ? "grid-cols-2" : "grid-cols-1")}>
            <PaiementSheet commandeId={c.id} reste={reste} />
            {lien("relance") && <WhatsAppButton href={lien("relance")!}>Relancer</WhatsAppButton>}
          </div>
        )}

        <h3 className="mb-2 text-sm font-semibold">Paiements</h3>
        {paiements && paiements.length > 0 ? (
          <ul className="divide-y text-sm">
            {paiements.map((p, i) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <span>
                  {formatDate(p.paye_le)} · {MODES_PAIEMENT.find((m) => m.cle === p.mode)?.label ?? "Autre"}
                  {i === 0 && <span className="text-muted-foreground"> (acompte)</span>}
                </span>
                <span className="font-semibold">{formatFCFA(p.montant)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun paiement pour l&apos;instant.</p>
        )}
      </section>
    </>
  );
}

function FicheSquelette() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
