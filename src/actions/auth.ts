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

export async function signOut(
  _previousState: AuthFormState,
  _formData: FormData,
): Promise<AuthFormState> {
  void _previousState;
  void _formData;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Could not sign out.", error);
      return { success: false, error: "Could not sign out. Please try again." };
    }
  } catch (error) {
    console.error("Sign-out request failed.", error);
    return { success: false, error: "Could not sign out. Please try again." };
  }

  redirect("/login");
}

function getPasswordRecoveryRedirectUrl(): string {
  if (
    process.env.VERCEL_ENV === "production" &&
    process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/auth/callback`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/auth/callback`;
  }

  return "http://localhost:3000/auth/callback";
}

export async function requestPasswordReset(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const emailValue = formData.get("email");

  if (typeof emailValue !== "string") {
    return { success: false, error: "Enter a valid email address." };
  }

  const email = emailValue.trim();

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return { success: false, error: "Enter a valid email address." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordRecoveryRedirectUrl(),
    });

    if (error) {
      console.error("Password reset request failed.", error);
      return {
        success: false,
        error: "Unable to request a password reset right now. Please try again.",
      };
    }

    return {
      success: true,
      message:
        "If an account exists for that email, a password reset link will be sent shortly.",
    };
  } catch (error) {
    console.error("Password reset request failed.", error);
    return {
      success: false,
      error: "Unable to request a password reset right now. Please try again.",
    };
  }
}

export async function resetPassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const passwordValue = formData.get("password");
  const confirmPasswordValue = formData.get("confirmPassword");

  if (
    typeof passwordValue !== "string" ||
    typeof confirmPasswordValue !== "string"
  ) {
    return { success: false, error: "Enter and confirm your new password." };
  }

  if (passwordValue.length < 8 || passwordValue.length > 128) {
    return {
      success: false,
      error: "Your password must be between 8 and 128 characters long.",
    };
  }

  if (passwordValue !== confirmPasswordValue) {
    return { success: false, error: "Your passwords do not match." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: passwordValue,
    });

    if (error) {
      console.error("Password update failed.", error);
      return {
        success: false,
        error:
          "Could not update your password. Your reset link may be invalid or expired; request a new one.",
      };
    }

    return {
      success: true,
      message: "Your password has been updated.",
    };
  } catch (error) {
    console.error("Password update failed.", error);
    return {
      success: false,
      error:
        "Could not update your password. Your reset link may be invalid or expired; request a new one.",
    };
  }
}
