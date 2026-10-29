import { Button } from "@/components/ui/button";

// Provisoire : remplacé par le tableau de bord à l'étape 3
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold text-primary">Taaru</h1>
      <p className="text-muted-foreground">Chaque commande sous contrôle, même à la Tabaski.</p>
      <div className="flex gap-2">
        <Button size="lg">Vert pétrole</Button>
        <Button size="lg" className="bg-or text-or-foreground hover:bg-or/90">
          Or
        </Button>
      </div>
    </main>
  );
}
