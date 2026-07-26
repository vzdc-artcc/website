import createClient from "openapi-fetch";
import type { paths } from "./generated/schema";

const baseUrl = process.env.NEXT_PUBLIC_OSMIUM_API_URL;

if (!baseUrl && typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.error("NEXT_PUBLIC_OSMIUM_API_URL is not set — osmium API calls will fail.");
}

export const osmiumBaseUrl = baseUrl ?? "";

/**
 * True when the osmium CDN is served from a local/private host (dev). Next.js 16's
 * image optimizer refuses to fetch upstream images that resolve to a private IP
 * (SSRF protection), which breaks `next/image` for CDN banners in local dev — so
 * we render those `unoptimized` (direct load) when this is set. In prod the CDN is
 * a public host, so optimization stays on.
 */
export const cdnImagesUnoptimized = /^https?:\/\/(localhost|127\.|\[?::1)/i.test(osmiumBaseUrl);

export const osmium = createClient<paths>({
    baseUrl: baseUrl ?? "",
    credentials: "include",
});
