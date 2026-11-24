"use client";

import { useState } from "react";
import {
  LoginCredentialsForm,
  type AuthMode,
} from "@/components/auth/login-credentials-form";

const modes: AuthMode[] = ["sign-in", "sign-up"];

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const isSignUp = mode === "sign-up";

  return (
    <section className="login-auth-panel" aria-labelledby="login-form-heading">
      <p className="login-auth-panel__eyebrow">ACCOUNT ACCESS / 01</p>
      <div className="login-auth-panel__heading">
        <h2 id="login-form-heading">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>
        <p>
          {isSignUp
            ? "Start tracking your vehicles and modifications."
            : "Sign in to pick up where your build left off."}
        </p>
      </div>

      <div className="login-mode-switch" role="group" aria-label="Account access">
        {modes.map((option, index) => {
          const selected = mode === option;
          const label = option === "sign-in" ? "Sign in" : "Sign up";

          return (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              aria-pressed={selected}
              className="login-mode-switch__button"
            >
              <span className="login-mode-switch__label">
                <span className="login-mode-switch__index" aria-hidden="true">
                  0{index + 1}
                </span>
                {label}
              </span>
              <span className="login-mode-switch__state">
                {selected ? "ACTIVE" : "SELECT"}
              </span>
            </button>
          );
        })}
      </div>

      <LoginCredentialsForm key={mode} mode={mode} />
    </section>
  );
}
