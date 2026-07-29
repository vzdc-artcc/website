import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

// --- Events ---

interface EventsQuery {
    page?: number;
    pageSize?: number;
}

export function useEvents(query: EventsQuery = {}) {
    return useQuery({
        queryKey: ["osmium", "events", "list", query.page, query.pageSize],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/events", {
                params: { query: { page: query.page, page_size: query.pageSize } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useEvent(eventId: string | undefined) {
    return useQuery({
        queryKey: ["osmium", "events", "item", eventId],
        enabled: !!eventId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/events/{event_id}", {
                params: { path: { event_id: eventId! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface CreateEventInput {
    title: string;
    event_type?: string | null;
    host?: string | null;
    description?: string | null;
    banner_asset_id?: string | null;
    starts_at: string;
    ends_at: string;
}

export function useCreateEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: CreateEventInput) => {
            const { data, error } = await osmium.POST("/api/v1/events", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events"] });
        },
    });
}

interface UpdateEventInput {
    title?: string;
    event_type?: string | null;
    host?: string | null;
    description?: string | null;
    status?: string;
    published?: boolean;
    banner_asset_id?: string | null;
    hidden?: boolean;
    manual_positions_open?: boolean;
    archived?: boolean;
    starts_at?: string;
    ends_at?: string;
}

export function useUpdateEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ eventId, body }: { eventId: string; body: UpdateEventInput }) => {
            const { data, error } = await osmium.PATCH("/api/v1/events/{event_id}", {
                params: { path: { event_id: eventId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events"] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "item", variables.eventId] });
        },
    });
}

export function useDeleteEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (eventId: string) => {
            const { error } = await osmium.DELETE("/api/v1/events/{event_id}", {
                params: { path: { event_id: eventId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events"] });
        },
    });
}

// --- Event positions ---

interface EventPositionsQuery {
    page?: number;
    pageSize?: number;
}

export function useEventPositions(eventId: string | undefined, query: EventPositionsQuery = {}) {
    return useQuery({
        queryKey: ["osmium", "events", "positions", eventId, query.page, query.pageSize],
        enabled: !!eventId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/events/{event_id}/positions", {
                params: {
                    path: { event_id: eventId! },
                    query: { page: query.page, page_size: query.pageSize ?? 200 },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useUserEventPositions(cid: number | undefined) {
    return useQuery({
        queryKey: ["osmium", "users", "event-positions", cid],
        enabled: !!cid,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/users/{cid}/event-positions", {
                params: { path: { cid: cid! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface CreateEventPositionInput {
    requested_position: string;
    requested_secondary_position?: string | null;
    notes?: string | null;
    requested_start_time: string;
    requested_end_time: string;
    user_id?: string | null;
    final_position?: string | null;
    final_start_time?: string | null;
    final_end_time?: string | null;
    final_notes?: string | null;
    controlling_category?: string | null;
    is_instructor?: boolean | null;
    is_solo?: boolean | null;
    is_ots?: boolean | null;
    is_tmu?: boolean | null;
    is_cic?: boolean | null;
}

export function useCreateEventPosition(eventId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: CreateEventPositionInput) => {
            const { data, error } = await osmium.POST("/api/v1/events/{event_id}/positions", {
                params: { path: { event_id: eventId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "positions", eventId] });
        },
    });
}

interface UpdateEventPositionInput {
    user_id?: string | null;
    assigned_slot?: number | null;
    final_position?: string | null;
    final_start_time?: string | null;
    final_end_time?: string | null;
    final_notes?: string | null;
    controlling_category?: string | null;
    is_instructor?: boolean | null;
    is_solo?: boolean | null;
    is_ots?: boolean | null;
    is_tmu?: boolean | null;
    is_cic?: boolean | null;
    published?: boolean | null;
    status?: string | null;
}

export function useUpdateEventPosition(eventId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ positionId, body }: { positionId: string; body: UpdateEventPositionInput }) => {
            const { data, error } = await osmium.PATCH("/api/v1/events/{event_id}/positions/{position_id}", {
                params: { path: { event_id: eventId, position_id: positionId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "positions", eventId] });
        },
    });
}

export function useDeleteEventPosition(eventId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (positionId: string) => {
            const { error } = await osmium.DELETE("/api/v1/events/{event_id}/positions/{position_id}", {
                params: { path: { event_id: eventId, position_id: positionId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "positions", eventId] });
        },
    });
}

export function usePublishEventPositions(eventId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { error } = await osmium.POST("/api/v1/events/{event_id}/positions/publish", {
                params: { path: { event_id: eventId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "positions", eventId] });
        },
    });
}

export function useSetPositionsLocked(eventId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (locked: boolean) => {
            const path = locked
                ? "/api/v1/events/{event_id}/positions/lock" as const
                : "/api/v1/events/{event_id}/positions/unlock" as const;
            const { error } = await osmium.POST(path, {
                params: { path: { event_id: eventId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "item", eventId] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "ops-plan", eventId] });
        },
    });
}

export function useQueueEventDiscordPublish(eventId: string) {
    return useMutation({
        mutationFn: async (pingUsers: boolean) => {
            const { error } = await osmium.POST("/api/v1/events/{event_id}/publish/discord", {
                params: { path: { event_id: eventId } },
                body: { ping_users: pingUsers },
            });
            if (error) throw error;
        },
    });
}

export function useQueueEventDiscordScheduledEvent(eventId: string) {
    return useMutation({
        mutationFn: async (location: string) => {
            const { error } = await osmium.POST("/api/v1/events/{event_id}/discord-event", {
                params: { path: { event_id: eventId } },
                body: { location },
            });
            if (error) throw error;
        },
    });
}

// --- Ops plan / TMIs / preset positions (single event) ---

export function useEventOpsPlan(eventId: string | undefined) {
    return useQuery({
        queryKey: ["osmium", "events", "ops-plan", eventId],
        enabled: !!eventId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/events/{event_id}/ops-plan", {
                params: { path: { event_id: eventId! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface UpdateEventOpsPlanInput {
    featured_fields?: string[];
    preset_positions?: string[];
    featured_field_configs?: unknown;
    tmis?: string | null;
    ops_free_text?: string | null;
    ops_plan_published?: boolean;
    ops_planner_id?: string | null;
    enable_buffer_times?: boolean;
}

export function useUpdateEventOpsPlan(eventId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: UpdateEventOpsPlanInput) => {
            const { data, error } = await osmium.PATCH("/api/v1/events/{event_id}/ops-plan", {
                params: { path: { event_id: eventId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "ops-plan", eventId] });
        },
    });
}

export function useEventTmis(eventId: string | undefined) {
    return useQuery({
        queryKey: ["osmium", "events", "tmis", eventId],
        enabled: !!eventId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/events/{event_id}/tmis", {
                params: { path: { event_id: eventId! }, query: { page_size: 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateEventTmi(eventId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: { tmi_type: string; start_time?: string | null; notes?: string | null }) => {
            const { data, error } = await osmium.POST("/api/v1/events/{event_id}/tmis", {
                params: { path: { event_id: eventId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "tmis", eventId] });
        },
    });
}

export function useUpdateEventTmi(eventId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ tmiId, body }: { tmiId: string; body: { tmi_type?: string; start_time?: string; notes?: string | null } }) => {
            const { data, error } = await osmium.PATCH("/api/v1/events/{event_id}/tmis/{tmi_id}", {
                params: { path: { event_id: eventId, tmi_id: tmiId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "tmis", eventId] });
        },
    });
}

export function useDeleteEventTmi(eventId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (tmiId: string) => {
            const { error } = await osmium.DELETE("/api/v1/events/{event_id}/tmis/{tmi_id}", {
                params: { path: { event_id: eventId, tmi_id: tmiId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "tmis", eventId] });
        },
    });
}

export function useEventPresetPositions(eventId: string | undefined) {
    return useQuery({
        queryKey: ["osmium", "events", "preset-positions", eventId],
        enabled: !!eventId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/events/{event_id}/preset-positions", {
                params: { path: { event_id: eventId! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useUpdateEventPresetPositions(eventId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (presetPositions: string[]) => {
            const { data, error } = await osmium.PUT("/api/v1/events/{event_id}/preset-positions", {
                params: { path: { event_id: eventId } },
                body: { preset_positions: presetPositions },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "preset-positions", eventId] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "ops-plan", eventId] });
        },
    });
}

// --- Named event-position-preset bundles ---

export function useEventPositionPresets() {
    return useQuery({
        queryKey: ["osmium", "event-position-presets", "list"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/event-position-presets", {
                params: { query: { page_size: 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useEventPositionPreset(presetId: string | undefined) {
    return useQuery({
        queryKey: ["osmium", "event-position-presets", "item", presetId],
        enabled: !!presetId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/event-position-presets/{preset_id}", {
                params: { path: { preset_id: presetId! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateEventPositionPreset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: { name: string; positions: string[] }) => {
            const { data, error } = await osmium.POST("/api/v1/event-position-presets", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "event-position-presets"] });
        },
    });
}

export function useUpdateEventPositionPreset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ presetId, body }: { presetId: string; body: { name?: string; positions?: string[] } }) => {
            const { data, error } = await osmium.PATCH("/api/v1/event-position-presets/{preset_id}", {
                params: { path: { preset_id: presetId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "event-position-presets"] });
        },
    });
}

export function useDeleteEventPositionPreset() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (presetId: string) => {
            const { error } = await osmium.DELETE("/api/v1/event-position-presets/{preset_id}", {
                params: { path: { preset_id: presetId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "event-position-presets"] });
        },
    });
}

// --- Ops plan file attachments ---

export function useOpsPlanFiles(eventId: string | undefined) {
    return useQuery({
        queryKey: ["osmium", "events", "ops-plan-files", eventId],
        enabled: !!eventId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/events/{event_id}/ops-plan/files", {
                params: { path: { event_id: eventId! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateOpsPlanFile(eventId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: { asset_id?: string | null; filename: string; url?: string | null; file_type?: string | null }) => {
            const { data, error } = await osmium.POST("/api/v1/events/{event_id}/ops-plan/files", {
                params: { path: { event_id: eventId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "ops-plan-files", eventId] });
        },
    });
}

export function useDeleteOpsPlanFile(eventId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (fileId: string) => {
            const { error } = await osmium.DELETE("/api/v1/events/{event_id}/ops-plan/files/{file_id}", {
                params: { path: { event_id: eventId, file_id: fileId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "events", "ops-plan-files", eventId] });
        },
    });
}
