import createClient from "openapi-fetch";
import type { paths } from "./generated/schema";

const baseUrl = process.env.NEXT_PUBLIC_OSMIUM_API_URL;

if (!baseUrl && typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.error("NEXT_PUBLIC_OSMIUM_API_URL is not set — osmium API calls will fail.");
}

export const osmiumBaseUrl = baseUrl ?? "";

export const osmium = createClient<paths>({
    baseUrl: baseUrl ?? "",
    credentials: "include",
});
