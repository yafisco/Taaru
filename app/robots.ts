import type { MetadataRoute } from "next";

// Seule la landing (« / ») est à indexer : le reste est l'espace privé des ateliers
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/clients", "/commandes", "/reglages", "/bienvenue"] },
  };
}
