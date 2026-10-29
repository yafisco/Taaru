import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

const ROUTES_PUBLIQUES = ["/connexion", "/inscription"];

// Rafraîchit la session Supabase et protège les routes. Appelé par proxy.ts.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([cle, valeur]) => response.headers.set(cle, valeur));
        },
      },
    }
  );

  // Ne rien mettre entre createServerClient et getClaims : la session doit être rafraîchie ici.
  const { data } = await supabase.auth.getClaims();
  const connecte = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  const routePublique = ROUTES_PUBLIQUES.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  if (!connecte && !routePublique) return rediriger(request, response, "/connexion");
  if (connecte && routePublique) return rediriger(request, response, "/");

  return response;
}

// Garde les cookies de session rafraîchis sur la réponse de redirection.
function rediriger(request: NextRequest, response: NextResponse, chemin: string) {
  const url = request.nextUrl.clone();
  url.pathname = chemin;
  url.search = "";
  const redirection = NextResponse.redirect(url);
  response.cookies.getAll().forEach((c) => redirection.cookies.set(c));
  return redirection;
}
