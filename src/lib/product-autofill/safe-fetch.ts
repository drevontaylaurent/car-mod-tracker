import { lookup as dnsLookup } from "node:dns";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";
import { isPublicIpAddress } from "./ip-safety.ts";

export const FETCH_TIMEOUT_MS = 8000;
export const MAX_RESPONSE_BYTES = 1_000_000;
const MAX_REDIRECTS = 3;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const PRIVATE_TARGET_ERROR = "This link points to a private or internal address.";

export class SafeFetchError extends Error {}

interface ResolvedAddress {
  address: string;
  family: number;
}

function assertSafeTarget(url: URL): void {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SafeFetchError("Only http and https links can be read.");
  }
  if (url.username || url.password) {
    throw new SafeFetchError("Links containing credentials are not supported.");
  }
  if (url.port && url.port !== "80" && url.port !== "443") {
    throw new SafeFetchError("This link uses an unsupported port.");
  }

  const host = url.hostname.replace(/^\[|\]$/g, "");
  const isLiteralIp = isIP(host) !== 0;
  if (isLiteralIp && !isPublicIpAddress(host)) {
    throw new SafeFetchError(PRIVATE_TARGET_ERROR);
  }
  if (
    !isLiteralIp &&
    (host === "localhost" || host.endsWith(".localhost") || !host.includes("."))
  ) {
    throw new SafeFetchError(PRIVATE_TARGET_ERROR);
  }
}

// Validates every resolved address at connect time so DNS rebinding cannot bypass the check.
function publicOnlyLookup(
  hostname: string,
  options: { all?: boolean },
  callback: (
    error: Error | null,
    address?: string | ResolvedAddress[],
    family?: number,
  ) => void,
): void {
  dnsLookup(hostname, { all: true }, (error, addresses) => {
    if (error) {
      callback(error);
      return;
    }
    if (
      addresses.length === 0 ||
      addresses.some((entry) => !isPublicIpAddress(entry.address))
    ) {
      callback(new SafeFetchError(PRIVATE_TARGET_ERROR));
      return;
    }
    if (options.all) {
      callback(null, addresses);
      return;
    }
    callback(null, addresses[0].address, addresses[0].family);
  });
}

interface HopResult {
  status: number;
  location: string | null;
  body: string;
}

function requestOnce(url: URL): Promise<HopResult> {
  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const request = client.request(
      url,
      {
        method: "GET",
        lookup: publicOnlyLookup as never,
        headers: {
          "User-Agent": "CarModTracker-Autofill/1.0",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Encoding": "identity",
        },
      },
      (response) => {
        const status = response.statusCode ?? 0;
        if (REDIRECT_STATUSES.has(status)) {
          response.resume();
          const location =
            typeof response.headers.location === "string" ? response.headers.location : null;
          resolve({ status, location, body: "" });
          return;
        }

        const contentType = response.headers["content-type"] ?? "";
        if (status < 200 || status >= 300 || !/html/i.test(contentType)) {
          response.resume();
          reject(new SafeFetchError("That page did not return readable product information."));
          return;
        }

        const chunks: Buffer[] = [];
        let received = 0;
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          resolve({
            status,
            location: null,
            body: Buffer.concat(chunks).subarray(0, MAX_RESPONSE_BYTES).toString("utf8"),
          });
        };
        response.on("data", (chunk: Buffer) => {
          received += chunk.length;
          chunks.push(chunk);
          if (received >= MAX_RESPONSE_BYTES) {
            response.destroy();
          }
        });
        response.on("end", finish);
        response.on("close", finish);
        response.on("error", finish);
      },
    );

    request.setTimeout(FETCH_TIMEOUT_MS, () => {
      request.destroy(new SafeFetchError("The product page took too long to respond."));
    });
    request.on("error", reject);
    request.end();
  });
}

export async function fetchPublicHtml(startUrl: string): Promise<string> {
  let current: URL;
  try {
    current = new URL(startUrl);
  } catch {
    throw new SafeFetchError("Enter a valid http:// or https:// product link.");
  }

  const deadline = Date.now() + FETCH_TIMEOUT_MS * 2;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    if (Date.now() > deadline) {
      throw new SafeFetchError("The product page took too long to respond.");
    }
    assertSafeTarget(current);
    const result = await requestOnce(current);
    if (!REDIRECT_STATUSES.has(result.status)) {
      return result.body;
    }
    if (!result.location) {
      throw new SafeFetchError("The product page redirected without a destination.");
    }
    try {
      current = new URL(result.location, current);
    } catch {
      throw new SafeFetchError("The product page redirected to an invalid address.");
    }
  }

  throw new SafeFetchError("The product page redirected too many times.");
}
