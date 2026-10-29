import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Pencil, Phone, Plus } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MesuresForm } from "@/components/mesures-form";
import { PageHeader } from "@/components/page-header";
import { StatutBadge } from "@/components/statut-badge";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { formatDate, formatFCFA } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { afficherTelephone } from "@/lib/whatsapp";
import { ClientSheet } from "../client-sheet";

export default function FicheClientPage({ params }: PageProps<"/clients/[id]">) {
  return (
    <Suspense fallback={<FicheSquelette />}>
      {params.then(({ id }) => (
        <FicheClient id={id} />
      ))}
    </Suspense>
  );
}

async function FicheClient({ id }: { id: string }) {
  if (!z.uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const [{ data: client }, { data: mesures }, { data: commandes }] = await Promise.all([
    supabase.from("clients").select("id, nom, telephone, quartier, genre").eq("id", id).maybeSingle(),
    supabase.from("mesures").select("valeurs, remarques, updated_at").eq("client_id", id).maybeSingle(),
    supabase
      .from("v_commandes")
      .select("id, code, modele, statut, date_livraison, reste")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);
  // La RLS renvoie null si le client appartient à un autre atelier
  if (!client) notFound();

  const genre = client.genre === "homme" || client.genre === "femme" ? client.genre : null;

  return (
    <>
      <PageHeader
        titre={client.nom}
        retour={{ href: "/clients", label: "Clients" }}
        action={
          <ClientSheet
            client={{
              id: client.id,
              nom: client.nom,
              telephone: client.telephone ? afficherTelephone(client.telephone) : "",
              quartier: client.quartier ?? "",
              genre,
            }}
            declencheur={
              <Button variant="outline" size="icon-lg" className="size-11" aria-label="Modifier le client">
                <Pencil />
              </Button>
            }
          />
        }
      />

      <div className="mb-6 space-y-1 text-muted-foreground">
        {client.telephone && (
          <p className="flex items-center gap-2">
            <Phone className="size-4" /> {afficherTelephone(client.telephone)}
          </p>
        )}
        {client.quartier && (
          <p className="flex items-center gap-2">
            <MapPin className="size-4" /> {client.quartier}
          </p>
        )}
      </div>

      {client.telephone ? (
        <div className="mb-6 grid grid-cols-2 gap-2">
          <a
            href={`tel:+${client.telephone}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border text-base font-semibold active:scale-95"
          >
            <Phone className="size-5" /> Appeler
          </a>
          <WhatsAppButton href={`https://wa.me/${client.telephone}`} />
        </div>
      ) : (
        <p className="mb-6 rounded-lg bg-muted px-3 py-2 text-sm">
          Ajoute son numéro (crayon en haut) pour l&apos;appeler ou le prévenir sur WhatsApp.
        </p>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Mesures</CardTitle>
          {mesures && (
            <p className="text-sm text-muted-foreground">Mises à jour le {formatDate(mesures.updated_at)}</p>
          )}
        </CardHeader>
        <CardContent>
          <MesuresForm
            clientId={client.id}
            genre={genre}
            valeurs={(mesures?.valeurs ?? {}) as Record<string, number>}
            remarques={mesures?.remarques ?? null}
          />
        </CardContent>
      </Card>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Commandes</h2>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/commandes/nouvelle?client=${client.id}`} />}
            className="h-10"
          >
            <Plus /> Nouvelle
          </Button>
        </div>
        {commandes && commandes.length > 0 ? (
          <ul className="divide-y rounded-xl border">
            {commandes.map((c) => (
              <li key={c.id}>
                <Link href={`/commandes/${c.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-muted">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.modele}</p>
                    <p className="text-sm text-muted-foreground">
                      n°{c.code}
                      {c.date_livraison && ` · ${formatDate(c.date_livraison)}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {c.statut && <StatutBadge statut={c.statut} />}
                    {(c.reste ?? 0) > 0 && (
                      <span className="text-sm font-medium text-destructive">{formatFCFA(c.reste ?? 0)}</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-muted-foreground">
            Aucune commande pour ce client.
          </p>
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
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
