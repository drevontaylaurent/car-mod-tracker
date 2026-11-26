export interface AmazonRawFields {
  title: string | null;
  brand: string | null;
  price: string | null;
}

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function textOfElementWithId(html: string, id: string, tag: string): string | null {
  const pattern = new RegExp(
    `<${tag}\\b[^>]*\\bid=["']${id}["'][^>]*>([\\s\\S]*?)</${tag}>`,
    "i",
  );
  const match = html.match(pattern);
  return match ? stripTags(match[1]) : null;
}

/**
 * Conservative extraction from a real Amazon product page. Returns nulls
 * unless the page clearly contains the product title element.
 */
export function readAmazonRawFields(html: string): AmazonRawFields {
  const empty: AmazonRawFields = { title: null, brand: null, price: null };
  const title = textOfElementWithId(html, "productTitle", "span");
  if (!title) return empty;

  const byline = textOfElementWithId(html, "bylineInfo", "a");
  const brand =
    byline?.match(/^Visit the (.+) Store$/i)?.[1] ??
    byline?.match(/^Brand:\s*(.+)$/i)?.[1] ??
    null;

  const priceBlock = html.match(
    /\bid=["']corePrice_feature_div["'][\s\S]*?<span class=["']a-offscreen["']>\s*([^<]+?)\s*<\/span>/i,
  );

  return { title, brand, price: priceBlock?.[1] ?? null };
}
