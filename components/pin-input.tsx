"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<"input">, "type" | "inputMode" | "maxLength">;

// Code PIN à 6 chiffres, masqué par défaut, avec un bouton pour l'afficher
export function PinInput({ className, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        autoComplete="off"
        {...props}
        type={visible ? "text" : "password"}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        className={cn("h-12 pr-12 text-lg tracking-[0.5em]", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le code" : "Afficher le code"}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground"
      >
        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  );
}
