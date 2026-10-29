import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LIMITE_GRATUIT, type Offre } from "@/lib/offre";
import { cn } from "@/lib/utils";

// Remplace le formulaire de nouvelle commande quand la limite Gratuit est atteinte
export function LimiteAtteinte({ enCours }: { enCours: number }) {
  return (
    <section className="rounded-xl border-2 border-or bg-or/10 p-5 text-center">
      <Lock className="mx-auto size-10 text-amber-700" />
      <h2 className="mt-3 text-lg font-bold">Tu as {enCours} commandes en cours</h2>
      <p className="mt-2 text-sm">
        L&apos;offre Gratuit va jusqu&apos;à {LIMITE_GRATUIT} commandes en cours. Une commande livrée ou annulée libère une place.
      </p>
      <Button nativeButton={false} render={<Link href="/pro" />} className="mt-5 h-12 w-full bg-or text-base font-bold text-or-foreground hover:bg-or/90">
        <Crown />
        Passer à Pro : commandes illimitées
      </Button>
      <Button nativeButton={false} variant="outline" render={<Link href="/commandes?onglet=pretes" />} className="mt-3 h-12 w-full text-base">
        Voir les commandes prêtes à livrer
      </Button>
    </section>
  );
}

// Sur l'accueil : prévient avant d'atteindre la limite, ou rappelle la fin de Pro
export function BandeauOffre({ offre }: { offre: Offre }) {
  if (offre.pro) return null;
  if (offre.enCours < LIMITE_GRATUIT - 10) return null;

  const plein = offre.limiteAtteinte;
  return (
    <Link
      href="/pro"
      className={cn(
        "mb-5 block rounded-xl border p-4 active:scale-[0.99]",
        plein ? "border-red-300 bg-red-50 text-red-800" : "border-or/50 bg-or/10 text-amber-900"
      )}
    >
      <p className="flex items-center gap-2 font-semibold">
        <Crown className="size-5" />
        {plein ? "Limite atteinte : passe à Pro" : `${offre.enCours} / ${LIMITE_GRATUIT} commandes en cours`}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
        <div
          className={cn("h-full rounded-full", plein ? "bg-red-600" : "bg-or")}
          style={{ width: `${Math.min(offre.enCours / LIMITE_GRATUIT, 1) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-sm">
        {plein
          ? "Tu ne peux plus ajouter de commande en Gratuit. Taaru Pro : commandes illimitées."
          : "Avec Taaru Pro, plus de limite pendant la saison des fêtes."}
      </p>
    </Link>
  );
}
