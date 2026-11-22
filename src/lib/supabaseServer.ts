/**
 * Blackout's Supabase server client.
 * Handles authentication and database access from the server.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a server-side Supabase client using cookies to keep users signed in.
 *
 * @returns The configured Supabase client.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore errors when cookies cannot be updated.
          }
        },
      },
    },
  );
}
