"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  AuthFormState,
  PasswordRecoveryFormState,
} from "@/types/auth";

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

  (await cookies()).delete("password-recovery-session");
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

    (await cookies()).delete("password-recovery-session");
  } catch (error) {
    console.error("Sign-out request failed.", error);
    return { success: false, error: "Could not sign out. Please try again." };
  }

  redirect("/login");
}

async function getPasswordRecoveryCallbackUrl(): Promise<string> {
  const requestHeaders = await headers();
  const hostHeader =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!hostHeader) {
    throw new Error("The current application host is unavailable.");
  }

  const host = new URL(`https://${hostHeader}`).host;
  const trustedHosts = new Set(
    [
      "localhost:3000",
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
      process.env.VERCEL_URL,
    ].filter((value): value is string => Boolean(value)),
  );

  if (!trustedHosts.has(host)) {
    throw new Error("The current application host is not trusted.");
  }

  const protocol = host === "localhost:3000" ? "http:" : "https:";
  return new URL("/auth/callback", `${protocol}//${host}`).toString();
}

async function getPasswordRecoveryClient() {
  try {
    const cookieStore = await cookies();

    if (cookieStore.get("password-recovery-session")?.value !== "verified") {
      return null;
    }

    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Could not verify password recovery session.", error);
      return null;
    }

    return user ? supabase : null;
  } catch (error) {
    console.error("Could not verify password recovery session.", error);
    return null;
  }
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
      redirectTo: await getPasswordRecoveryCallbackUrl(),
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

export async function checkPasswordRecoverySession(): Promise<AuthFormState> {
  const supabase = await getPasswordRecoveryClient();

  if (!supabase) {
    return {
      success: false,
      error: "This reset link is invalid or expired. Request a new one.",
    };
  }

  return { success: true };
}

export async function resetPassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<PasswordRecoveryFormState> {
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

  const supabase = await getPasswordRecoveryClient();

  if (!supabase) {
    return {
      success: false,
      error: "This reset link is invalid or expired. Request a new one.",
      recoverySessionInvalid: true,
    };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordValue,
    });

    if (error) {
      console.error("Password update failed.", error);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        return {
          success: false,
          error: "This reset link is invalid or expired. Request a new one.",
          recoverySessionInvalid: true,
        };
      }

      return {
        success: false,
        error:
          "Could not update your password. Your reset link may be invalid or expired; request a new one.",
      };
    }

    try {
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      });

      if (signOutError) {
        console.error("Could not sign out after password reset.", signOutError);
      }
    } catch (error) {
      console.error("Could not sign out after password reset.", error);
    }

    (await cookies()).delete("password-recovery-session");

    return {
      success: true,
      message: "Your password has been updated.",
    };
  } catch (error) {
    console.error("Password update failed.", error);
    return {
      success: false,
      error:
        "This reset link is invalid or expired. Request a new one.",
      recoverySessionInvalid: true,
    };
  }
}
