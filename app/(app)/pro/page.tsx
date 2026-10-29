import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Crown, Handshake } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { formatFCFA } from "@/lib/format";
import { FORMULES_PRO, LIMITE_GRATUIT, PRIX_INSTALLATION, lienContactTaaru, lireOffre } from "@/lib/offre";
import { createClient } from "@/lib/supabase/server";
import { afficherTelephone } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Taaru Pro · Taaru" };

export default function ProPage() {
  return (
    <>
      <PageHeader titre="Taaru Pro" retour={{ href: "/reglages", label: "Réglages" }} />
      <Suspense fallback={<ProSquelette />}>
        <Pro />
      </Suspense>
    </>
  );
}

async function Pro() {
  const supabase = await createClient();
  const [{ data: atelier }, offre, { data: contact }] = await Promise.all([
    supabase.from("ateliers").select("nom, telephone").maybeSingle(),
    lireOffre(supabase),
    supabase.rpc("contact_taaru"),
  ]);
  if (!atelier || !offre) redirect("/connexion");

  const compte = afficherTelephone(atelier.telephone);
  const lien = (message: string) => (contact ? lienContactTaaru(contact, message) : null);
  const lienInstallation = lien(`Bonjour Taaru, je veux l'installation accompagnée pour mon atelier ${atelier.nom} (${compte}).`);

  return (
    <div className="space-y-6">
      {offre.pro ? (
        <section className="rounded-xl bg-primary p-5 text-primary-foreground">
          <p className="flex items-center gap-2 text-lg font-bold">
            <Crown className="size-5 text-or" /> Tu es Pro
          </p>
          <p className="mt-1 opacity-90">
            Jusqu&apos;au {format(new Date(offre.proJusquAu!), "d MMMM yyyy", { locale: fr })} inclus. Commandes illimitées.
          </p>
        </section>
      ) : (
        <section className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Ton offre actuelle</p>
          <p className="mt-1 text-lg font-bold">Gratuit</p>
          <p className="mt-1 text-sm">
            {offre.enCours} / {LIMITE_GRATUIT} commandes en cours
          </p>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-semibold">Ce que Pro te donne</h2>
        <ul className="space-y-2">
          {["Commandes en cours illimitées, même en pleine Tabaski", "Tout ce que tu as déjà : clients, mesures, acomptes, WhatsApp"].map((t) => (
            <li key={t} className="flex gap-2">
              <Check className="mt-0.5 size-5 shrink-0 text-primary" /> {t}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 font-semibold">{offre.pro ? "Prolonger Pro" : "Choisis ta formule"}</h2>
        {contact ? (
          <>
            <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm">
              <li>
                Envoie le montant par <strong>Wave</strong> au <strong>{afficherTelephone(contact)}</strong>.
              </li>
              <li>Appuie sur le bouton de ta formule : le message WhatsApp est déjà écrit.</li>
              <li>Ton atelier passe en Pro dans la journée.</li>
            </ol>
            <div className="space-y-3">
              {FORMULES_PRO.map((f) => {
                const href = lien(
                  `Bonjour Taaru, j'ai envoyé ${formatFCFA(f.montant)} par Wave pour Taaru Pro ${f.label}. Atelier : ${atelier.nom}. Numéro du compte : ${compte}.`
                );
                return (
                  <div key={f.mois} className="rounded-xl border p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-semibold">{f.label}</p>
                      <p className="text-xl font-bold">{formatFCFA(f.montant)}</p>
                    </div>
                    {f.mois > 1 && (
                      <p className="text-sm text-muted-foreground">
                        Au lieu de {formatFCFA(FORMULES_PRO[0].montant * f.mois)} au mois
                      </p>
                    )}
                    {href && (
                      <WhatsAppButton href={href} className="mt-3 w-full">
                        J&apos;ai payé {formatFCFA(f.montant)}
                      </WhatsAppButton>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            Le paiement de Taaru Pro ouvre très bientôt. En attendant, profite de l&apos;offre Gratuit.
          </p>
        )}
      </section>

      <section className="rounded-xl border-2 border-or/50 bg-or/10 p-5">
        <p className="flex items-center gap-2 font-semibold">
          <Handshake className="size-5 text-amber-700" /> Installation accompagnée · {formatFCFA(PRIX_INSTALLATION)}
        </p>
        <p className="mt-2 text-sm">
          On vient à ton atelier, on recopie ton cahier (clients et mesures) dans Taaru et on te montre tout en 30 minutes.
          Une seule fois, et c&apos;est optionnel.
        </p>
        {lienInstallation && (
          <WhatsAppButton href={lienInstallation} className="mt-4 w-full">
            Demander l&apos;installation
          </WhatsAppButton>
        )}
      </section>
    </div>
  );
}

function ProSquelette() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
