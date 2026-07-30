import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

interface FeedbackListQuery {
    status?: string;
    submitterCid?: number;
    submitterName?: string;
    targetCid?: number;
    targetName?: string;
    controllerPosition?: string;
    minRating?: number;
    maxRating?: number;
    page?: number;
    pageSize?: number;
}

export function useFeedbackList(query: FeedbackListQuery = {}) {
    return useQuery({
        queryKey: [
            "osmium",
            "feedback",
            "list",
            query.status,
            query.submitterCid,
            query.submitterName,
            query.targetCid,
            query.targetName,
            query.controllerPosition,
            query.minRating,
            query.maxRating,
            query.page,
            query.pageSize,
        ],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/feedback", {
                params: {
                    query: {
                        status: query.status,
                        submitter_cid: query.submitterCid,
                        submitter_name: query.submitterName,
                        target_cid: query.targetCid,
                        target_name: query.targetName,
                        controller_position: query.controllerPosition,
                        min_rating: query.minRating,
                        max_rating: query.maxRating,
                        page: query.page,
                        page_size: query.pageSize,
                    },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useFeedbackItem(feedbackId: string) {
    return useQuery({
        queryKey: ["osmium", "feedback", "item", feedbackId],
        enabled: !!feedbackId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/feedback/{feedback_id}", {
                params: { path: { feedback_id: feedbackId } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useReceivedFeedback(cid: number, options: { status?: string; page?: number; pageSize?: number } = {}) {
    return useQuery({
        queryKey: ["osmium", "feedback", "received", cid, options.status, options.page, options.pageSize],
        enabled: !!cid,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/users/{cid}/feedback", {
                params: {
                    path: { cid },
                    query: { status: options.status, page: options.page, page_size: options.pageSize },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface CreateFeedbackInput {
    target_cid: number;
    pilot_callsign: string;
    controller_position: string;
    rating: number;
    comments?: string | null;
}

export function useCreateFeedback() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: CreateFeedbackInput) => {
            const { data, error } = await osmium.POST("/api/v1/feedback", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "feedback"] });
        },
    });
}

interface DecideFeedbackInput {
    feedbackId: string;
    status: "RELEASED" | "STASHED";
    staffComments?: string | null;
}

export function useDecideFeedback() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ feedbackId, status, staffComments }: DecideFeedbackInput) => {
            const { data, error } = await osmium.PATCH("/api/v1/feedback/{feedback_id}", {
                params: { path: { feedback_id: feedbackId } },
                body: { status, staff_comments: staffComments },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "feedback"] });
        },
    });
}
