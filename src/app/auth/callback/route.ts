import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next");

  let redirectUrl = new URL("/", requestUrl.origin);

  if (nextParam) {
    const candidateUrl = new URL(nextParam, requestUrl.origin);

    if (candidateUrl.origin === requestUrl.origin) {
      redirectUrl = candidateUrl;
    }
  }

  if (code) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      redirectUrl.searchParams.set("authReturn", "true");

      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(new URL("/?authError=true", requestUrl.origin));
}
