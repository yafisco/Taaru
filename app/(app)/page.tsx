import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { addDays, format, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertTriangle, CalendarClock, CheckCircle2, PartyPopper, Plus, Scissors } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { calculerModeFete, type ModeFete } from "@/lib/fete";
import { formatFCFA } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default function AccueilPage() {
  return (
    <Suspense fallback={<AccueilSquelette />}>
      <TableauDeBord />
    </Suspense>
  );
}

async function TableauDeBord() {
  const supabase = await createClient();
  const maintenant = new Date();
  const [{ data: atelier }, { data: commandes }, { data: paiements }] = await Promise.all([
    supabase.from("ateliers").select("nom, capacite_semaine, fete_nom, fete_date").maybeSingle(),
    supabase.from("v_commandes").select("statut, date_livraison, reste, en_retard, evenement").neq("statut", "annulee"),
    supabase.from("paiements").select("montant").gte("paye_le", startOfMonth(maintenant).toISOString()),
  ]);
  if (!atelier) redirect("/connexion");

  const liste = commandes ?? [];
  const aujourdhui = format(maintenant, "yyyy-MM-dd");
  const dans7j = format(addDays(maintenant, 7), "yyyy-MM-dd");
  const enCours = (s: string | null) => s === "recue" || s === "coupe" || s === "couture";

  const tuiles = {
    enCours: liste.filter((c) => enCours(c.statut)).length,
    pretes: liste.filter((c) => c.statut === "prete").length,
    aLivrer7j: liste.filter(
      (c) =>
        (enCours(c.statut) || c.statut === "prete") &&
        c.date_livraison &&
        c.date_livraison >= aujourdhui &&
        c.date_livraison <= dans7j
    ).length,
    enRetard: liste.filter((c) => c.en_retard).length,
  };
  // Les commandes annulées sont exclues de la requête : elles ne gonflent pas le reste à encaisser
  const encaisseMois = (paiements ?? []).reduce((s, p) => s + p.montant, 0);
  const resteAEncaisser = liste.reduce((s, c) => s + Math.max(c.reste ?? 0, 0), 0);
  const fete = calculerModeFete(
    { nom: atelier.fete_nom, date: atelier.fete_date, capaciteSemaine: atelier.capacite_semaine },
    liste,
    maintenant
  );

  return (
    <>
      <header className="mb-5">
        <p className="text-sm text-muted-foreground first-letter:uppercase">
          {format(maintenant, "EEEE d MMMM", { locale: fr })}
        </p>
        <h1 className="truncate text-2xl font-bold">{atelier.nom}</h1>
      </header>

      {fete && <CarteFete fete={fete} />}

      {liste.length === 0 ? (
        <Link
          href="/commandes/nouvelle"
          className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center active:bg-muted"
        >
          <Plus className="size-10 text-primary" />
          <p className="font-semibold">Aucune commande pour l&apos;instant.</p>
          <p className="text-sm text-muted-foreground">Ajoute la première en 1 minute.</p>
        </Link>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Tuile href="/commandes" icone={Scissors} valeur={tuiles.enCours} label="En cours" />
          <Tuile href="/commandes?onglet=pretes" icone={CheckCircle2} valeur={tuiles.pretes} label="Prêtes à récupérer" ton="vert" />
          <Tuile href="/commandes" icone={CalendarClock} valeur={tuiles.aLivrer7j} label="À livrer dans 7 j" ton="or" />
          <Tuile href="/commandes" icone={AlertTriangle} valeur={tuiles.enRetard} label="En retard" ton={tuiles.enRetard > 0 ? "rouge" : undefined} />
        </div>
      )}

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-primary p-4 text-primary-foreground">
          <p className="text-sm opacity-90">Encaissé ce mois</p>
          <p className="mt-1 text-xl font-bold">{formatFCFA(encaisseMois)}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Reste à encaisser</p>
          <p className={cn("mt-1 text-xl font-bold", resteAEncaisser > 0 && "text-red-700")}>{formatFCFA(resteAEncaisser)}</p>
        </div>
      </section>
    </>
  );
}

const TONS = {
  vert: "border-emerald-200 bg-emerald-50 text-emerald-800",
  or: "border-or/40 bg-or/10 text-amber-900",
  rouge: "border-red-300 bg-red-50 text-red-700",
} as const;

type TuileProps = {
  href: string;
  icone: React.ComponentType<{ className?: string }>;
  valeur: number;
  label: string;
  ton?: keyof typeof TONS;
};

function Tuile({ href, icone: Icone, valeur, label, ton }: TuileProps) {
  return (
    <Link href={href} className={cn("flex min-h-28 flex-col justify-between rounded-xl border p-4 active:scale-[0.98]", ton && TONS[ton])}>
      <Icone className="size-6 opacity-80" />
      <div>
        <p className="text-3xl font-bold">{valeur}</p>
        <p className="text-sm font-medium">{label}</p>
      </div>
    </Link>
  );
}

function CarteFete({ fete }: { fete: ModeFete }) {
  const remplissage = fete.capacite > 0 ? Math.min(fete.commandesAFaire / fete.capacite, 1) : 1;
  const place = Math.max(fete.capacite - fete.commandesAFaire, 0);

  return (
    <section
      className={cn(
        "mb-5 rounded-xl border-2 p-4",
        fete.complet ? "border-red-400 bg-red-50" : "border-or bg-or/10"
      )}
    >
      <div className="flex items-center gap-2">
        <PartyPopper className={cn("size-5", fete.complet ? "text-red-700" : "text-amber-700")} />
        <p className="font-semibold">
          {fete.nom} {fete.joursRestants === 0 ? "aujourd'hui" : `dans ${fete.joursRestants} jour${fete.joursRestants > 1 ? "s" : ""}`}
        </p>
      </div>

      <p className="mt-3 text-sm">
        <span className="text-2xl font-bold">{fete.commandesAFaire}</span> tenue{fete.commandesAFaire > 1 ? "s" : ""} à coudre
        sur une capacité d&apos;environ <span className="font-semibold">{fete.capacite}</span>
      </p>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-background" role="progressbar" aria-valuenow={Math.round(remplissage * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn("h-full rounded-full", fete.complet ? "bg-red-600" : "bg-primary")} style={{ width: `${remplissage * 100}%` }} />
      </div>

      {fete.complet ? (
        <p role="alert" className="mt-3 flex items-center gap-2 font-bold text-red-700">
          <AlertTriangle className="size-5" /> Tu es complet ! N&apos;accepte plus de commandes pour la {fete.nom}.
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Tu peux encore accepter environ {place} tenue{place > 1 ? "s" : ""}.
        </p>
      )}
    </section>
  );
}

function AccueilSquelette() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}
