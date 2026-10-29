import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16 : « middleware.ts » s'appelle désormais « proxy.ts ».
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Tout sauf les fichiers statiques, les scripts de public/vendor, les images, les vidéos,
  // le manifeste PWA et robots.txt
  matcher: [
    "/((?!_next/static|_next/image|vendor/|favicon.ico|manifest.webmanifest|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)",
  ],
};
