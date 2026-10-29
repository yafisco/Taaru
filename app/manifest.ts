import type { MetadataRoute } from "next";

// PWA : installable sur l'écran d'accueil (Android : menu ⋮ > « Ajouter à l'écran d'accueil »)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Taaru",
    short_name: "Taaru",
    description: "Chaque commande sous contrôle, même à la Tabaski.",
    lang: "fr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0F5257",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Même image : le « t » tient dans la zone sûre, Android peut la découper en cercle
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
