import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16 : « middleware.ts » s'appelle désormais « proxy.ts ».
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Tout sauf les fichiers statiques, les images et le manifeste PWA
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
