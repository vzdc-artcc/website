import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";
import type { components } from "@/lib/osmium/generated/schema";

export type AtcBookingItem = components["schemas"]["AtcBookingItem"];

export interface CreateOrUpdateAtcBookingInput {
    id?: number;
    callsign: string;
    cid: number;
    type?: string | null;
    division?: string | null;
    subdivision?: string | null;
    start: string;
    end: string;
}

/** Pull the user-facing message out of an osmium error body (400 `{message}`, or a coded error). */
function bookingErrorMessage(error: unknown): string {
    const e = error as { message?: string; error?: string } | undefined;
    if (e?.message) return e.message;
    if (e?.error === "service_unavailable") return "The ATC booking service is currently unavailable.";
    if (e?.error) return e.error;
    return "Something went wrong with the ATC booking service.";
}

export function useAtcBookings(cid?: number) {
    return useQuery({
        queryKey: ["osmium", "bookings", "list", cid ?? "all"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/bookings", {
                params: { query: { cid } },
            });
            if (error) throw new Error(bookingErrorMessage(error));
            return data;
        },
    });
}

export function useAtcBooking(id: number | undefined) {
    return useQuery({
        queryKey: ["osmium", "bookings", "item", id],
        enabled: !!id,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/bookings/{id}", {
                params: { path: { id: id! } },
            });
            if (error) throw new Error(bookingErrorMessage(error));
            return data;
        },
    });
}

export function useCreateOrUpdateAtcBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreateOrUpdateAtcBookingInput) => {
            const body = {
                callsign: input.callsign,
                cid: input.cid,
                type: input.type ?? undefined,
                division: input.division ?? undefined,
                subdivision: input.subdivision ?? undefined,
                start: input.start,
                end: input.end,
            };
            if (typeof input.id === "number") {
                const { data, error } = await osmium.PUT("/api/v1/bookings/{id}", {
                    params: { path: { id: input.id } },
                    body,
                });
                if (error) throw new Error(bookingErrorMessage(error));
                return data;
            }
            const { data, error } = await osmium.POST("/api/v1/bookings", { body });
            if (error) throw new Error(bookingErrorMessage(error));
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "bookings"] });
        },
    });
}

export function useDeleteAtcBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { error } = await osmium.DELETE("/api/v1/bookings/{id}", {
                params: { path: { id } },
            });
            if (error) throw new Error(bookingErrorMessage(error));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "bookings"] });
        },
    });
}
