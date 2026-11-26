import { isIP } from "node:net";

function isPublicIpv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) {
    return false;
  }
  const [a, b, c] = parts;

  if (a === 0 || a === 10 || a === 127) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false;
  if (a === 192 && b === 168) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;
  if (a === 198 && b === 51 && c === 100) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  if (a >= 224) return false;
  return true;
}

function parseIpv6(ip: string): number[] | null {
  let address = ip.split("%")[0].toLowerCase();
  const lastColon = address.lastIndexOf(":");
  const tail = address.slice(lastColon + 1);
  if (tail.includes(".")) {
    const octets = tail.split(".").map(Number);
    if (octets.length !== 4 || octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) {
      return null;
    }
    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    address = `${address.slice(0, lastColon + 1)}${high}:${low}`;
  }

  const halves = address.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const rest = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - rest.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;

  const hextets = [...head, ...Array<string>(halves.length === 2 ? missing : 0).fill("0"), ...rest];
  const values = hextets.map((part) => parseInt(part, 16));
  if (values.length !== 8 || values.some((v) => Number.isNaN(v) || v < 0 || v > 0xffff)) {
    return null;
  }
  return values;
}

function isPublicIpv6(ip: string): boolean {
  const h = parseIpv6(ip);
  if (!h) return false;

  const isMappedV4 = h.slice(0, 5).every((v) => v === 0) && h[5] === 0xffff;
  if (isMappedV4) {
    return isPublicIpv4(`${h[6] >> 8}.${h[6] & 255}.${h[7] >> 8}.${h[7] & 255}`);
  }
  if (h.every((v) => v === 0) || (h.slice(0, 7).every((v) => v === 0) && h[7] === 1)) {
    return false;
  }
  if ((h[0] & 0xfe00) === 0xfc00) return false;
  if ((h[0] & 0xffc0) === 0xfe80) return false;
  if ((h[0] & 0xff00) === 0xff00) return false;
  if (h[0] === 0x2001 && h[1] === 0x0db8) return false;
  if (h[0] === 0x0064 && h[1] === 0xff9b) return false;
  if (h[0] === 0x2002) return false;
  return true;
}

export function isPublicIpAddress(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPublicIpv4(ip);
  if (version === 6) return isPublicIpv6(ip);
  return false;
}
