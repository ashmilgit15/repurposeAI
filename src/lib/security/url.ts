import "server-only";

import { isIP } from "node:net";

const MAX_EXTERNAL_URL_LENGTH = 2048;
const DISALLOWED_HOST_SUFFIXES = [".local", ".internal", ".localhost", ".lan", ".home", ".arpa"];

function isPrivateIpv4(ip: string): boolean {
  const octets = ip.split(".").map((value) => Number.parseInt(value, 10));
  const [first, second] = octets;

  return (
    first === 10 ||
    first === 127 ||
    first === 0 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 100 && second >= 64 && second <= 127)
  );
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
}

export function parsePublicHttpUrl(input: unknown): URL {
  if (typeof input !== "string") {
    throw new Error("URL is required");
  }

  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("URL is required");
  }

  if (trimmed.length > MAX_EXTERNAL_URL_LENGTH) {
    throw new Error("URL is too long");
  }

  const url = new URL(trimmed);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }

  if (url.username || url.password) {
    throw new Error("URLs with embedded credentials are not allowed");
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || DISALLOWED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    throw new Error("Local or internal URLs are not allowed");
  }

  const ipVersion = isIP(hostname);
  if (
    (ipVersion === 4 && isPrivateIpv4(hostname)) ||
    (ipVersion === 6 && isPrivateIpv6(hostname))
  ) {
    throw new Error("Private network URLs are not allowed");
  }

  return url;
}
