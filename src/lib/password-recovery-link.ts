export function getPasswordRecoveryLinkState(
  query: string,
  fragment: string,
): "invalid" | "exchange" | "verify" {
  const searchParams = new URLSearchParams(query);
  const hashParams = new URLSearchParams(fragment.replace(/^#/, ""));

  if (
    searchParams.has("error") ||
    searchParams.has("error_code") ||
    hashParams.has("error") ||
    hashParams.has("error_code")
  ) {
    return "invalid";
  }

  return searchParams.has("code") ? "exchange" : "verify";
}
