import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname === "/") {
    const redirectResponse = NextResponse.redirect(
      new URL(user ? "/garage" : "/login", request.url),
    );
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  if (!user) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/", "/garage/:path*", "/profile"],
};
