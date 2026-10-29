import { Label } from "@/components/ui/label";

type Props = { id: string; label: string; erreur?: string; aide?: string; children: React.ReactNode };

export function Champ({ id, label, erreur, aide, children }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>
      {children}
      {erreur ? (
        <p id={`${id}-erreur`} className="text-sm text-destructive">
          {erreur}
        </p>
      ) : (
        aide && <p className="text-sm text-muted-foreground">{aide}</p>
      )}
    </div>
  );
}

export function ErreurFormulaire({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
      {message}
    </p>
  );
}
