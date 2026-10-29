import { Button } from "@/components/ui/button";
import { deconnecter } from "./(auth)/actions";

// Provisoire : remplacé par le tableau de bord à l'étape 3
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold text-primary">Taaru</h1>
      <p className="text-muted-foreground">Tu es connecté. Le tableau de bord arrive à l&apos;étape 3.</p>
      <form action={deconnecter}>
        <Button type="submit" size="lg" variant="outline" className="h-12">
          Se déconnecter
        </Button>
      </form>
    </main>
  );
}
