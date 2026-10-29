import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { deconnecter } from "@/app/(auth)/actions";

// Provisoire : réglages complets à l'étape 6
export default function ReglagesPage() {
  return (
    <>
      <PageHeader titre="Réglages" />
      <p className="mb-6 text-muted-foreground">Les réglages de l&apos;atelier arrivent à l&apos;étape 6.</p>
      <form action={deconnecter}>
        <Button type="submit" variant="outline" size="lg" className="h-12 w-full text-base">
          <LogOut />
          Se déconnecter
        </Button>
      </form>
    </>
  );
}
