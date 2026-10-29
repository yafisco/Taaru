"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type InfoReseau = { saveData?: boolean; effectiveType?: string };

type Props = {
  /** Vidéo verticale (mobile) et, en option, paysage (à partir de 768 px) */
  mobile: { video: string; poster: string };
  ordinateur?: { video: string; poster: string };
  /** true : ne charge la vidéo qu'à l'approche de l'écran (sections plus bas) */
  differe?: boolean;
  className?: string;
};

// La vidéo ne coûte rien tant qu'elle n'est pas utile : l'image fixe s'affiche d'abord,
// la vidéo arrive ensuite, et jamais en mode économie de données, en 2G ou si
// l'utilisateur a demandé à réduire les animations.
export function VideoFond({ mobile, ordinateur, differe = false, className }: Props) {
  const conteneur = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [charger, setCharger] = useState(false);
  const [prete, setPrete] = useState(false);

  useEffect(() => {
    const reseau = (navigator as Navigator & { connection?: InfoReseau }).connection;
    if (reseau?.saveData || /2g$/.test(reseau?.effectiveType ?? "")) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (differe) {
      const obs = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          setCharger(true);
          obs.disconnect();
        },
        { rootMargin: "200px" }
      );
      if (conteneur.current) obs.observe(conteneur.current);
      return () => obs.disconnect();
    }
    // Haut de page : on attend que tout le reste soit chargé
    const lancer = () => setCharger(true);
    if (document.readyState === "complete") {
      const t = setTimeout(lancer, 0);
      return () => clearTimeout(t);
    }
    window.addEventListener("load", lancer, { once: true });
    return () => window.removeEventListener("load", lancer);
  }, [differe]);

  // Met en pause hors de l'écran (batterie, processeur des petits téléphones)
  useEffect(() => {
    const v = video.current;
    if (!charger || !v) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    obs.observe(v);
    return () => obs.disconnect();
  }, [charger]);

  return (
    <div ref={conteneur} className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden>
      <picture>
        {ordinateur && <source media="(min-width: 768px)" srcSet={ordinateur.poster} />}
        {/* eslint-disable-next-line @next/next/no-img-element -- poster décoratif, déjà compressé */}
        <img src={mobile.poster} alt="" className="size-full object-cover" fetchPriority={differe ? "low" : "high"} />
      </picture>
      {charger && (
        <video
          ref={video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setPrete(true)}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-1000",
            prete ? "opacity-100" : "opacity-0"
          )}
        >
          {ordinateur && <source media="(min-width: 768px)" src={ordinateur.video} type="video/mp4" />}
          <source src={mobile.video} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
