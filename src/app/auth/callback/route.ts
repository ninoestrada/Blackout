/**
 * Blackout's authentication callback.
 * Completes sign-in and redirects users to the appropriate page.
 */

import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * Handles the return from Google sign-in by exchanging the authorization
 * code for a Supabase session and redirecting the user back to Blackout.
 *
 * @param request - The callback request containing the authorization code.
 * @returns A redirect to the appropriate page based on the sign-in result.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const authCode = requestUrl.searchParams.get("code");
  const redirectPath = requestUrl.searchParams.get("next");

  let redirectUrl = new URL("/", requestUrl.origin);

  // Only allow redirects within the application.
  if (redirectPath) {
    const requestedUrl = new URL(redirectPath, requestUrl.origin);

    if (requestedUrl.origin === requestUrl.origin) {
      redirectUrl = requestedUrl;
    }
  }

  if (authCode) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.exchangeCodeForSession(authCode);

    if (!error) {
      redirectUrl.searchParams.set("authReturn", "true");

      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(new URL("/?authError=true", requestUrl.origin));
}
