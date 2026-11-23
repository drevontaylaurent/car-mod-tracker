import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/reset-password?error=invalid-link", request.url),
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Could not establish password recovery session.", error);
      return NextResponse.redirect(
        new URL("/reset-password?error=invalid-link", request.url),
      );
    }
  } catch (error) {
    console.error("Could not establish password recovery session.", error);
    return NextResponse.redirect(
      new URL("/reset-password?error=invalid-link", request.url),
    );
  }

  return NextResponse.redirect(new URL("/reset-password", request.url));
}
