import { createServerClient } from "@supabase/ssr";
import { io } from "next/cache";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

// Client serveur : composants serveur et Server Actions.
// À recréer à chaque requête, ne jamais le partager.
export async function createClient() {
  const cookieStore = await cookies();
  // Cache Components : auth-js lit Date.now() pour vérifier l'expiration du jeton.
  // io() signale une opération d'entrée/sortie : tout ce qui suit est calculé à la requête.
  await io();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Appelé depuis un composant serveur : on ne peut pas écrire de cookie.
            // Sans risque, car proxy.ts rafraîchit la session à chaque requête.
          }
        },
      },
    }
  );
}
