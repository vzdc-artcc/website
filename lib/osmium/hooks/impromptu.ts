import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {osmium} from "@/lib/osmium/client";

const OFFERS_KEY = ["osmium", "impromptu-offers"];

export function useImpromptuOffers() {
    return useQuery({
        queryKey: OFFERS_KEY,
        queryFn: async () => {
            const {data, error} = await osmium.GET("/api/v1/training/impromptu-offers");
            if (error) throw error;
            return data;
        },
    });
}

export function useImpromptuOffer(offerId: string | undefined) {
    return useQuery({
        queryKey: [...OFFERS_KEY, offerId],
        enabled: !!offerId,
        // Claims trickle in from Discord, so poll while the offer is still open;
        // stop once it's accepted/cancelled so closed offers don't keep hitting the API.
        refetchInterval: (query) => (query.state.data?.status === 'open' ? 5000 : false),
        queryFn: async () => {
            const {data, error} = await osmium.GET("/api/v1/training/impromptu-offers/{offer_id}", {
                params: {path: {offer_id: offerId as string}},
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateImpromptuOffer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: {
            session_types: string[],
            available_at?: string | null,
            notes?: string | null,
        }) => {
            const {data, error} = await osmium.POST("/api/v1/training/impromptu-offers", {body});
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({queryKey: OFFERS_KEY}),
    });
}

export function useAcceptImpromptuOffer(offerId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            const {data, error} = await osmium.POST("/api/v1/training/impromptu-offers/{offer_id}/accept", {
                params: {path: {offer_id: offerId}},
                body: {user_id: userId},
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({queryKey: OFFERS_KEY}),
    });
}

export function useCancelImpromptuOffer(offerId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const {data, error} = await osmium.POST("/api/v1/training/impromptu-offers/{offer_id}/cancel", {
                params: {path: {offer_id: offerId}},
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({queryKey: OFFERS_KEY}),
    });
}
