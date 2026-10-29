"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** true quand l'élément entre dans l'écran (une seule fois) */
export function useVisible<T extends Element>(marge = "-10% 0px") {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setVisible(true);
        obs.disconnect();
      },
      { rootMargin: marge }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [marge]);
  return [ref, visible] as const;
}

type Props = { children: React.ReactNode; delai?: number; className?: string };

// Le contenu glisse et apparaît au défilement. Rien ne bouge si « réduire les animations » est activé.
export function Apparition({ children, delai = 0, className }: Props) {
  const [ref, visible] = useVisible<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delai}ms` }}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100",
        className
      )}
    >
      {children}
    </div>
  );
}
