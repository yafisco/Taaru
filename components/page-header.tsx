import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Props = { titre: string; retour?: { href: string; label: string }; action?: React.ReactNode };

export function PageHeader({ titre, retour, action }: Props) {
  return (
    <header className="mb-5">
      {retour && (
        <Link href={retour.href} className="-ml-1 mb-2 inline-flex h-11 items-center text-sm font-medium text-muted-foreground">
          <ChevronLeft className="size-5" />
          {retour.label}
        </Link>
      )}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{titre}</h1>
        {action}
      </div>
    </header>
  );
}
