import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { href: string; children?: React.ReactNode; className?: string };

// Lien wa.me stylé en bouton (vert WhatsApp). Ouvre l'app WhatsApp sur mobile.
export function WhatsAppButton({ href, children = "WhatsApp", className }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-base font-semibold text-white active:scale-95",
        className
      )}
    >
      <MessageCircle className="size-5" />
      {children}
    </a>
  );
}
