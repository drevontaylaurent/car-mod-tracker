import type { ProductAutofillData } from "../../types/product-autofill.ts";
import type { SelectableModCategory } from "../../types/database.ts";
import { readAmazonRawFields } from "./amazon-product-fields.ts";

type JsonObject = Record<string, unknown>;

const MAX_PART_NAME_LENGTH = 150;
const MAX_BRAND_LENGTH = 100;
const MAX_PRICE = 9_999_999_999.99;

const CATEGORY_KEYWORDS: Record<SelectableModCategory, readonly RegExp[]> = {
  "Power Mods": [
    /\bexhaust\b/, /\bintake\b/, /\bturbo/, /\bsuspension\b/, /\bcoilover/,
    /\bengine\b/, /\bwheels?\b/, /\btires?\b/, /\bsupercharg/, /\bperformance\b/,
  ],
  Interior: [/\binterior\b/, /\bseats?\b/, /\bsteering wheel\b/, /\bfloor mats?\b/, /\bshift knob/],
  Exterior: [/\bexterior\b/, /\bbumpers?\b/, /\bspoilers?\b/, /\bbody kit/, /\bgrilles?\b/, /\bfender/],
  "Maintenance Parts": [
    /\bmaintenance\b/, /\boil filters?\b/, /\bair filters?\b/, /\bbrake pads?\b/,
    /\bspark plugs?\b/, /\bwiper/,
  ],
};

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
};

function decodeEntities(value: string): string {
  return value.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (match, dec, hex, name) => {
    if (dec) return String.fromCodePoint(Number(dec));
    if (hex) return String.fromCodePoint(parseInt(hex, 16));
    return ENTITIES[String(name).toLowerCase()] ?? match;
  });
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = decodeEntities(value).replace(/\s+/g, " ").trim();
  if (cleaned.length === 0 || cleaned.length > maxLength) return null;
  return cleaned;
}

function readMetaTags(html: string): Map<string, string> {
  const meta = new Map<string, string>();
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attributes = new Map<string, string>();
    for (const match of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? "");
    }
    const key = (attributes.get("property") ?? attributes.get("name") ?? "").toLowerCase();
    const content = attributes.get("content");
    if (key && content !== undefined && !meta.has(key)) {
      meta.set(key, content);
    }
  }
  return meta;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectProducts(node: unknown, found: JsonObject[], depth = 0): void {
  if (depth > 6) return;
  if (Array.isArray(node)) {
    node.forEach((item) => collectProducts(item, found, depth + 1));
    return;
  }
  if (!isObject(node)) return;

  const type = node["@type"];
  const types = Array.isArray(type) ? type : [type];
  if (types.includes("Product")) found.push(node);
  collectProducts(node["@graph"], found, depth + 1);
}

function readJsonLdProduct(html: string): JsonObject | null {
  const products: JsonObject[] = [];
  const pattern = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(pattern)) {
    try {
      collectProducts(JSON.parse(match[1].trim()), products);
    } catch {
      continue;
    }
  }
  return products[0] ?? null;
}

function readBrand(value: unknown): string | null {
  if (typeof value === "string") return cleanText(value, MAX_BRAND_LENGTH);
  if (isObject(value)) return cleanText(value.name, MAX_BRAND_LENGTH);
  return null;
}

function parsePrice(amount: unknown, currency: unknown): number | null {
  if (typeof currency !== "string" || currency.toUpperCase() !== "USD") return null;
  const text = typeof amount === "number" ? String(amount) : amount;
  if (typeof text !== "string" || !/^\d{1,10}(?:\.\d{1,4})?$/.test(text.trim())) return null;

  const price = Math.round(Number(text) * 100) / 100;
  return Number.isFinite(price) && price >= 0 && price <= MAX_PRICE ? price : null;
}

function readJsonLdPrice(product: JsonObject): number | null {
  const offers = Array.isArray(product.offers) ? product.offers : [product.offers];
  const prices = offers
    .filter(isObject)
    .map((offer) => parsePrice(offer.price ?? offer.lowPrice, offer.priceCurrency));
  const first = prices[0];
  // Offers with differing prices are ambiguous, so leave the price for the user.
  return first !== null && first !== undefined && prices.every((p) => p === first) ? first : null;
}

export function mapCategoryText(text: string | null): SelectableModCategory | null {
  if (!text) return null;
  const normalized = text.toLowerCase();
  const matches = (Object.keys(CATEGORY_KEYWORDS) as SelectableModCategory[]).filter(
    (category) => CATEGORY_KEYWORDS[category].some((pattern) => pattern.test(normalized)),
  );
  return matches.length === 1 ? matches[0] : null;
}

export function parseProductMetadata(html: string): ProductAutofillData {
  const generic = parseGenericMetadata(html);
  if (generic.partName && generic.brand && generic.price !== null) return generic;

  const amazon = readAmazonRawFields(html);
  const amazonPrice = amazon.price?.match(/^\$\s*([\d,]+(?:\.\d{1,2})?)$/);
  return {
    ...generic,
    partName: generic.partName ?? cleanText(amazon.title, MAX_PART_NAME_LENGTH),
    brand: generic.brand ?? cleanText(amazon.brand, MAX_BRAND_LENGTH),
    price:
      generic.price ??
      (amazonPrice ? parsePrice(amazonPrice[1].replace(/,/g, ""), "USD") : null),
  };
}

const BOT_CHALLENGE_PATTERN =
  /validateCaptcha|not a robot|characters you see below|automated access to amazon data/i;

export function isBotChallengePage(html: string): boolean {
  return BOT_CHALLENGE_PATTERN.test(html);
}

function parseGenericMetadata(html: string): ProductAutofillData {
  const meta = readMetaTags(html);
  const product = readJsonLdProduct(html);

  const partName =
    cleanText(product?.name, MAX_PART_NAME_LENGTH) ??
    cleanText(meta.get("og:title"), MAX_PART_NAME_LENGTH) ??
    cleanText(meta.get("twitter:title"), MAX_PART_NAME_LENGTH);

  const brand =
    readBrand(product?.brand) ??
    cleanText(meta.get("product:brand"), MAX_BRAND_LENGTH) ??
    cleanText(meta.get("og:brand"), MAX_BRAND_LENGTH);

  const price =
    (product ? readJsonLdPrice(product) : null) ??
    parsePrice(
      meta.get("product:price:amount") ?? meta.get("og:price:amount"),
      meta.get("product:price:currency") ?? meta.get("og:price:currency"),
    );

  const categoryText =
    cleanText(product?.category, 200) ?? cleanText(meta.get("product:category"), 200);

  return { partName, brand, price, category: mapCategoryText(categoryText) };
}

export function hasAutofillData(data: ProductAutofillData): boolean {
  return Object.values(data).some((value) => value !== null);
}
