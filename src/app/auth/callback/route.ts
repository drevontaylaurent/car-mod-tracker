import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return invalidRecoveryResponse(request);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Could not exchange password recovery code.", error);
      return invalidRecoveryResponse(request);
    }

    const cookieStore = await cookies();
    cookieStore.set("password-recovery-session", "verified", {
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return NextResponse.redirect(new URL("/reset-password", request.url));
  } catch (error) {
    console.error("Could not exchange password recovery code.", error);
    return invalidRecoveryResponse(request);
  }
}

function invalidRecoveryResponse(request: NextRequest) {
  const response = NextResponse.redirect(
    new URL("/reset-password?error=invalid-link", request.url),
  );
  response.cookies.delete("password-recovery-session");
  return response;
}
