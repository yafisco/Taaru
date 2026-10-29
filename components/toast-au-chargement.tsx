"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

// Affiche un toast une fois, puis retire le paramètre d'URL (?nouvelle=1) pour ne pas le rejouer
export function ToastAuChargement({ message }: { message: string }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    toast.success(message);
    router.replace(pathname, { scroll: false });
  }, [message, pathname, router]);

  return null;
}
