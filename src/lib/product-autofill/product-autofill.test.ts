import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPublicIpAddress } from "./ip-safety.ts";
import { isBotChallengePage, mapCategoryText, parseProductMetadata } from "./parse-product-metadata.ts";

describe("isPublicIpAddress", () => {
  it("rejects private, loopback and link-local addresses", () => {
    for (const ip of [
      "127.0.0.1", "10.0.0.5", "172.16.0.1", "192.168.1.1", "169.254.169.254",
      "0.0.0.0", "100.64.0.1", "::1", "::", "fe80::1", "fd00::1",
      "::ffff:127.0.0.1", "::ffff:7f00:1", "not-an-ip",
    ]) {
      assert.equal(isPublicIpAddress(ip), false, ip);
    }
  });

  it("accepts public addresses", () => {
    for (const ip of ["8.8.8.8", "93.184.216.34", "2606:4700:4700::1111"]) {
      assert.equal(isPublicIpAddress(ip), true, ip);
    }
  });
});

describe("parseProductMetadata", () => {
  it("reads JSON-LD Product data", () => {
    const html = `<script type="application/ld+json">${JSON.stringify({
      "@graph": [
        {
          "@type": "Product",
          name: "Cold Air Intake &amp; Kit",
          brand: { "@type": "Brand", name: "K-Tuned" },
          category: "Performance Intake",
          offers: { "@type": "Offer", price: "249.99", priceCurrency: "USD" },
        },
      ],
    })}</script>`;
    assert.deepEqual(parseProductMetadata(html), {
      partName: "Cold Air Intake & Kit",
      brand: "K-Tuned",
      price: 249.99,
      category: "Power Mods",
    });
  });

  it("falls back to Open Graph metadata", () => {
    const html = `<meta property="og:title" content="Floor Mats">
      <meta property="product:price:amount" content="59.00">
      <meta property="product:price:currency" content="USD">`;
    assert.deepEqual(parseProductMetadata(html), {
      partName: "Floor Mats",
      brand: null,
      price: 59,
      category: null,
    });
  });

  it("does not guess non-USD prices or ambiguous categories", () => {
    const html = `<script type="application/ld+json">{"@type":"Product","name":"X","category":"Interior exhaust","offers":{"price":"10","priceCurrency":"EUR"}}</script>`;
    const data = parseProductMetadata(html);
    assert.equal(data.price, null);
    assert.equal(data.category, null);
  });

  it("returns nothing for pages without metadata", () => {
    assert.deepEqual(parseProductMetadata("<html></html>"), {
      partName: null, brand: null, price: null, category: null,
    });
  });
});

describe("Amazon product pages", () => {
  const productHtml = `<html><body>
    <span id="productTitle" class="a-size-large">
      Short Shifter &amp; Bracket Kit
    </span>
    <a id="bylineInfo" class="a-link-normal" href="/stores/Hurst">Visit the Hurst Store</a>
    <div id="corePrice_feature_div"><span class="a-price"><span class="a-offscreen">$1,249.50</span></span></div>
    </body></html>`;

  it("extracts clearly present title, brand and price", () => {
    assert.deepEqual(parseProductMetadata(productHtml), {
      partName: "Short Shifter & Bracket Kit",
      brand: "Hurst",
      price: 1249.5,
      category: null,
    });
  });

  it("does not read price without the core price block or a USD symbol", () => {
    const html = `<span id="productTitle">Part</span><span class="a-offscreen">$5.00</span>`;
    assert.equal(parseProductMetadata(html).price, null);
    const euro = `<span id="productTitle">Part</span><div id="corePrice_feature_div"><span class="a-offscreen">€5.00</span></div>`;
    assert.equal(parseProductMetadata(euro).price, null);
  });

  it("detects the bot-challenge interstitial and extracts nothing from it", () => {
    const challenge = `<title dir="ltr">Amazon.com</title><form action="/errors_page/validateCaptcha"><button>Continue shopping</button></form>`;
    assert.equal(isBotChallengePage(challenge), true);
    assert.deepEqual(parseProductMetadata(challenge), {
      partName: null, brand: null, price: null, category: null,
    });
    assert.equal(isBotChallengePage(productHtml), false);
  });
});

describe("mapCategoryText", () => {
  it("maps only confident matches", () => {
    assert.equal(mapCategoryText("Oil Filters"), "Maintenance Parts");
    assert.equal(mapCategoryText("Widgets"), null);
  });
});
