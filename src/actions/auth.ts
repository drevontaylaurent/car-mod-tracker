"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "@/types/auth";

export async function authenticate(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const intentValue = formData.get("intent");

  if (
    typeof emailValue !== "string" ||
    typeof passwordValue !== "string" ||
    (intentValue !== "sign-in" && intentValue !== "sign-up")
  ) {
    return { success: false, error: "Please enter a valid email and password." };
  }

  const email = emailValue.trim();
  const password = passwordValue;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Enter a valid email address." };
  }

  if (!password || password.length > 128) {
    return { success: false, error: "Enter a password up to 128 characters long." };
  }

  if (intentValue === "sign-up" && password.length < 8) {
    return {
      success: false,
      error: "Your password must be at least 8 characters long.",
    };
  }

  try {
    const supabase = await createClient();

    if (intentValue === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.session) {
        return {
          success: true,
          message: "Check your email for a confirmation link to finish creating your account.",
        };
      }
    }
  } catch (error) {
    console.error("Authentication request failed.", error);
    return {
      success: false,
      error: "Authentication is temporarily unavailable. Please try again.",
    };
  }

  redirect("/garage");
}
