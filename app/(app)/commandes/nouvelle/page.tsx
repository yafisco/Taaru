import { PageHeader } from "@/components/page-header";

// Provisoire : formulaire « commande en moins de 60 s » à l'étape 4
export default function NouvelleCommandePage() {
  return (
    <>
      <PageHeader titre="Nouvelle commande" retour={{ href: "/commandes", label: "Commandes" }} />
      <p className="text-muted-foreground">Le formulaire arrive à l&apos;étape 4.</p>
    </>
  );
}
