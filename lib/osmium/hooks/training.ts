import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

// --- Training statistics ---

/**
 * Aggregated training-session statistics for a scope. `month` is 0-based
 * (0 = January); omit for a full-year view. `cid` scopes to one instructor;
 * omit for facility-wide. Backs the /training/statistics pages.
 */
export function useTrainingStats(params: { year?: number; month?: number; cid?: number }) {
    const { year, month, cid } = params;
    return useQuery({
        queryKey: ["osmium", "training", "stats", year, month, cid],
        enabled: year !== undefined,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/training/stats", {
                params: {
                    query: {
                        year: year!,
                        month: month === undefined || month < 0 ? undefined : month,
                        cid,
                    },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

/** All-time sum of training-session hours (statistics layout card). */
export function useAllTimeTrainingHours() {
    return useQuery({
        queryKey: ["osmium", "training", "stats", "all-time-hours"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/training/stats/all-time-hours");
            if (error) throw error;
            return data?.hours ?? 0;
        },
    });
}

// --- Training assignments ---

export function useTrainingAssignments(query: { page?: number; pageSize?: number } = {}) {
    return useQuery({
        queryKey: ["osmium", "training", "assignments", "list", query.page, query.pageSize],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/training/assignments", {
                params: { query: { page: query.page, page_size: query.pageSize ?? 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useTrainingAssignment(assignmentId: string | undefined) {
    return useQuery({
        queryKey: ["osmium", "training", "assignments", "item", assignmentId],
        enabled: !!assignmentId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/training/assignments/{assignment_id}", {
                params: { path: { assignment_id: assignmentId! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateTrainingAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: { student_id: string; primary_trainer_id: string; other_trainer_ids?: string[] }) => {
            const { data, error } = await osmium.POST("/api/v1/training/assignments", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "assignments"] });
        },
    });
}

export function useUpdateTrainingAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ assignmentId, body }: { assignmentId: string; body: { primary_trainer_id?: string; other_trainer_ids?: string[] } }) => {
            const { data, error } = await osmium.PATCH("/api/v1/training/assignments/{assignment_id}", {
                params: { path: { assignment_id: assignmentId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "assignments"] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "assignments", "item", variables.assignmentId] });
        },
    });
}

export function useDeleteTrainingAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (assignmentId: string) => {
            const { error } = await osmium.DELETE("/api/v1/training/assignments/{assignment_id}", {
                params: { path: { assignment_id: assignmentId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "assignments"] });
        },
    });
}

// --- Training assignment requests ---

export function useTrainingAssignmentRequests(query: { page?: number; pageSize?: number } = {}) {
    return useQuery({
        queryKey: ["osmium", "training", "assignment-requests", "list", query.page, query.pageSize],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/training/assignment-requests", {
                params: { query: { page: query.page, page_size: query.pageSize ?? 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateTrainingAssignmentRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: { student_id?: string; submitted_at?: string } = {}) => {
            const { data, error } = await osmium.POST("/api/v1/training/assignment-requests", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "assignment-requests"] });
        },
    });
}

export function useDecideTrainingAssignmentRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ requestId, status }: { requestId: string; status: "APPROVED" | "DENIED" }) => {
            const { data, error } = await osmium.PATCH("/api/v1/training/assignment-requests/{request_id}", {
                params: { path: { request_id: requestId } },
                body: { status },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "assignment-requests"] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "assignments"] });
        },
    });
}

export function useDeleteTrainingAssignmentRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (requestId: string) => {
            const { error } = await osmium.DELETE("/api/v1/training/assignment-requests/{request_id}", {
                params: { path: { request_id: requestId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "assignment-requests"] });
        },
    });
}

export function useAddAssignmentRequestInterest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (requestId: string) => {
            const { error } = await osmium.POST("/api/v1/training/assignment-requests/{request_id}/interest", {
                params: { path: { request_id: requestId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "assignment-requests"] });
        },
    });
}

export function useRemoveAssignmentRequestInterest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (requestId: string) => {
            const { error } = await osmium.DELETE("/api/v1/training/assignment-requests/{request_id}/interest", {
                params: { path: { request_id: requestId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "assignment-requests"] });
        },
    });
}

// --- Trainer release requests ---

export function useTrainerReleaseRequests(query: { page?: number; pageSize?: number } = {}) {
    return useQuery({
        queryKey: ["osmium", "training", "release-requests", "list", query.page, query.pageSize],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/training/trainer-release-requests", {
                params: { query: { page: query.page, page_size: query.pageSize ?? 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateTrainerReleaseRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (studentId?: string) => {
            const { data, error } = await osmium.POST("/api/v1/training/trainer-release-requests", {
                body: { student_id: studentId ?? null },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "release-requests"] });
        },
    });
}

export function useDecideTrainerReleaseRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ requestId, status }: { requestId: string; status: "APPROVED" | "DENIED" }) => {
            const { data, error } = await osmium.PATCH("/api/v1/training/trainer-release-requests/{request_id}", {
                params: { path: { request_id: requestId } },
                body: { status },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "release-requests"] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "assignments"] });
        },
    });
}

export function useDeleteTrainerReleaseRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (requestId: string) => {
            const { error } = await osmium.DELETE("/api/v1/training/trainer-release-requests/{request_id}", {
                params: { path: { request_id: requestId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "release-requests"] });
        },
    });
}

// --- OTS recommendations ---

export function useOtsRecommendations(query: { page?: number; pageSize?: number } = {}) {
    return useQuery({
        queryKey: ["osmium", "training", "ots-recommendations", "list", query.page, query.pageSize],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/training/ots-recommendations", {
                params: { query: { page: query.page, page_size: query.pageSize ?? 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateOtsRecommendation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: { student_id: string; notes: string }) => {
            const { data, error } = await osmium.POST("/api/v1/training/ots-recommendations", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "ots-recommendations"] });
        },
    });
}

export function useUpdateOtsRecommendation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ recommendationId, assignedInstructorId }: { recommendationId: string; assignedInstructorId: string | null }) => {
            const { data, error } = await osmium.PATCH("/api/v1/training/ots-recommendations/{recommendation_id}", {
                params: { path: { recommendation_id: recommendationId } },
                body: { assigned_instructor_id: assignedInstructorId },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "ots-recommendations"] });
        },
    });
}

export function useDeleteOtsRecommendation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (recommendationId: string) => {
            const { error } = await osmium.DELETE("/api/v1/training/ots-recommendations/{recommendation_id}", {
                params: { path: { recommendation_id: recommendationId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "ots-recommendations"] });
        },
    });
}

// --- Lessons ---

export function useTrainingLessons(query: { page?: number; pageSize?: number } = {}) {
    return useQuery({
        queryKey: ["osmium", "training", "lessons", "list", query.page, query.pageSize],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/training/lessons", {
                params: { query: { page: query.page, page_size: query.pageSize ?? 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface LessonInput {
    identifier: string;
    location: number;
    name: string;
    description: string;
    position: string;
    facility: string;
    duration: number;
    trainee_preparation?: string | null;
    instructor_only: boolean;
    notify_instructor_on_pass: boolean;
    release_request_on_pass: boolean;
    performance_indicator_template_id?: string | null;
}

export function useCreateTrainingLesson() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: LessonInput) => {
            const { data, error } = await osmium.POST("/api/v1/training/lessons", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "lessons"] });
        },
    });
}

export function useUpdateTrainingLesson() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ lessonId, body }: { lessonId: string; body: LessonInput }) => {
            const { data, error } = await osmium.PATCH("/api/v1/training/lessons/{lesson_id}", {
                params: { path: { lesson_id: lessonId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "lessons"] });
        },
    });
}

export function useDeleteTrainingLesson() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (lessonId: string) => {
            const { error } = await osmium.DELETE("/api/v1/training/lessons/{lesson_id}", {
                params: { path: { lesson_id: lessonId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "lessons"] });
        },
    });
}

// --- Lesson rubric ---

export function useLessonRubric(lessonId: string | undefined) {
    return useQuery({
        queryKey: ["osmium", "training", "lessons", "rubric", lessonId],
        enabled: !!lessonId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/training/lessons/{lesson_id}/rubric", {
                params: { path: { lesson_id: lessonId! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface RubricCriteriaInput {
    criteria: string;
    description: string;
    max_points: number;
    passing: number;
    sort_order?: number | null;
}

export function useCreateLessonRubricCriteria(lessonId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: RubricCriteriaInput) => {
            const { data, error } = await osmium.POST("/api/v1/training/lessons/{lesson_id}/rubric-criteria", {
                params: { path: { lesson_id: lessonId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "lessons", "rubric", lessonId] });
        },
    });
}

export function useUpdateLessonRubricCriteria(lessonId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ criteriaId, body }: { criteriaId: string; body: RubricCriteriaInput }) => {
            const { data, error } = await osmium.PATCH("/api/v1/training/lessons/{lesson_id}/rubric-criteria/{criteria_id}", {
                params: { path: { lesson_id: lessonId, criteria_id: criteriaId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "lessons", "rubric", lessonId] });
        },
    });
}

export function useDeleteLessonRubricCriteria(lessonId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (criteriaId: string) => {
            const { error } = await osmium.DELETE("/api/v1/training/lessons/{lesson_id}/rubric-criteria/{criteria_id}", {
                params: { path: { lesson_id: lessonId, criteria_id: criteriaId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "lessons", "rubric", lessonId] });
        },
    });
}

export function useCreateLessonRubricCell(lessonId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ criteriaId, body }: { criteriaId: string; body: { points: number; description: string } }) => {
            const { data, error } = await osmium.POST("/api/v1/training/lessons/{lesson_id}/rubric-criteria/{criteria_id}/cells", {
                params: { path: { lesson_id: lessonId, criteria_id: criteriaId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "lessons", "rubric", lessonId] });
        },
    });
}

export function useUpdateLessonRubricCell(lessonId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ criteriaId, cellId, body }: { criteriaId: string; cellId: string; body: { points: number; description: string } }) => {
            const { data, error } = await osmium.PATCH("/api/v1/training/lessons/{lesson_id}/rubric-criteria/{criteria_id}/cells/{cell_id}", {
                params: { path: { lesson_id: lessonId, criteria_id: criteriaId, cell_id: cellId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "lessons", "rubric", lessonId] });
        },
    });
}

export function useDeleteLessonRubricCell(lessonId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ criteriaId, cellId }: { criteriaId: string; cellId: string }) => {
            const { error } = await osmium.DELETE("/api/v1/training/lessons/{lesson_id}/rubric-criteria/{criteria_id}/cells/{cell_id}", {
                params: { path: { lesson_id: lessonId, criteria_id: criteriaId, cell_id: cellId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "lessons", "rubric", lessonId] });
        },
    });
}

// --- Training appointments ---

interface TrainingAppointmentsQuery {
    page?: number;
    pageSize?: number;
    trainerId?: string;
    studentId?: string;
    userId?: string;
    sortField?: string;
    sortOrder?: string;
}

export function useTrainingAppointments(query: TrainingAppointmentsQuery = {}) {
    return useQuery({
        queryKey: ["osmium", "training", "appointments", "list", query.page, query.pageSize, query.trainerId, query.studentId, query.userId, query.sortField, query.sortOrder],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/training/appointments", {
                params: {
                    query: {
                        page: query.page,
                        page_size: query.pageSize ?? 200,
                        trainer_id: query.trainerId,
                        student_id: query.studentId,
                        user_id: query.userId,
                        sort_field: query.sortField,
                        sort_order: query.sortOrder,
                    },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useTrainingAppointment(appointmentId: string | undefined) {
    return useQuery({
        queryKey: ["osmium", "training", "appointments", "item", appointmentId],
        enabled: !!appointmentId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/training/appointments/{appointment_id}", {
                params: { path: { appointment_id: appointmentId! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface AdditionalTrainerInput {
    trainer_id: string;
    description: string;
}

interface CreateTrainingAppointmentInput {
    student_id: string;
    start: string;
    lesson_ids: string[];
    environment?: string | null;
    notes?: string | null;
    additional_trainers?: AdditionalTrainerInput[];
}

export function useCreateTrainingAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: CreateTrainingAppointmentInput) => {
            const { data, error } = await osmium.POST("/api/v1/training/appointments", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "appointments"] });
        },
    });
}

interface UpdateTrainingAppointmentInput {
    student_id: string;
    start: string;
    lesson_ids: string[];
    environment?: string | null;
    double_booking?: boolean;
    preparation_completed?: boolean;
    warning_email_sent?: boolean;
    atc_booking_id?: string | null;
    notes?: string | null;
    additional_trainers?: AdditionalTrainerInput[];
}

export function useUpdateTrainingAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ appointmentId, body }: { appointmentId: string; body: UpdateTrainingAppointmentInput }) => {
            const { data, error } = await osmium.PATCH("/api/v1/training/appointments/{appointment_id}", {
                params: { path: { appointment_id: appointmentId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "appointments"] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "appointments", "item", variables.appointmentId] });
        },
    });
}

export function useDeleteTrainingAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (appointmentId: string) => {
            const { error } = await osmium.DELETE("/api/v1/training/appointments/{appointment_id}", {
                params: { path: { appointment_id: appointmentId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "appointments"] });
        },
    });
}

// --- Training sessions ---

interface TrainingSessionsQuery {
    page?: number;
    pageSize?: number;
    studentId?: string;
    instructorId?: string;
    sortField?: string;
    sortOrder?: string;
    filterField?: string;
    filterOperator?: string;
    filterValue?: string;
}

export function useTrainingSessions(query: TrainingSessionsQuery = {}) {
    return useQuery({
        queryKey: [
            "osmium", "training", "sessions", "list",
            query.page, query.pageSize, query.studentId, query.instructorId,
            query.sortField, query.sortOrder, query.filterField, query.filterOperator, query.filterValue,
        ],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/training/sessions", {
                params: {
                    query: {
                        page: query.page,
                        page_size: query.pageSize ?? 200,
                        student_id: query.studentId,
                        instructor_id: query.instructorId,
                        sort_field: query.sortField,
                        sort_order: query.sortOrder,
                        filter_field: query.filterField,
                        filter_operator: query.filterOperator,
                        filter_value: query.filterValue,
                    },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useTrainingSession(sessionId: string | undefined) {
    return useQuery({
        queryKey: ["osmium", "training", "sessions", "item", sessionId],
        enabled: !!sessionId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/training/sessions/{session_id}", {
                params: { path: { session_id: sessionId! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface RubricScoreInput {
    criteria_id: string;
    cell_id: string;
    passed: boolean;
}

interface TrainingTicketInput {
    lesson_id: string;
    passed: boolean;
    scores: RubricScoreInput[];
}

interface PerformanceIndicatorCriteriaInput {
    name: string;
    order: number;
    marker: string;
    comments?: string | null;
}

interface PerformanceIndicatorCategoryInput {
    name: string;
    order: number;
    criteria: PerformanceIndicatorCriteriaInput[];
}

interface TrainingSessionInput {
    student_id: string;
    start: string;
    end: string;
    additional_comments?: string | null;
    trainer_comments?: string | null;
    enable_markdown?: boolean;
    tickets: TrainingTicketInput[];
    performance_indicator?: { categories: PerformanceIndicatorCategoryInput[] } | null;
    additional_trainers?: AdditionalTrainerInput[];
}

export function useCreateTrainingSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: TrainingSessionInput) => {
            const { data, error } = await osmium.POST("/api/v1/training/sessions", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "sessions"] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "ots-recommendations"] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "release-requests"] });
        },
    });
}

export function useUpdateTrainingSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ sessionId, body }: { sessionId: string; body: TrainingSessionInput }) => {
            const { data, error } = await osmium.PATCH("/api/v1/training/sessions/{session_id}", {
                params: { path: { session_id: sessionId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "sessions"] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "sessions", "item", variables.sessionId] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "ots-recommendations"] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "release-requests"] });
        },
    });
}

export function useDeleteTrainingSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sessionId: string) => {
            const { error } = await osmium.DELETE("/api/v1/training/sessions/{session_id}", {
                params: { path: { session_id: sessionId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "sessions"] });
        },
    });
}

// --- Progressions ---

export function useTrainingProgressions(query: { page?: number; pageSize?: number } = {}) {
    return useQuery({
        queryKey: ["osmium", "training", "progressions", "list", query.page, query.pageSize],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/training/progressions", {
                params: { query: { page: query.page, page_size: query.pageSize ?? 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface TrainingProgressionInput {
    name: string;
    next_progression_id?: string | null;
    auto_assign_new_home_obs?: boolean;
    auto_assign_new_visitor?: boolean;
}

export function useCreateTrainingProgression() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: TrainingProgressionInput) => {
            const { data, error } = await osmium.POST("/api/v1/admin/training/progressions", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "progressions"] });
        },
    });
}

export function useUpdateTrainingProgression() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ progressionId, body }: { progressionId: string; body: Partial<TrainingProgressionInput> }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/training/progressions/{progression_id}", {
                params: { path: { progression_id: progressionId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "progressions"] });
        },
    });
}

export function useDeleteTrainingProgression() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (progressionId: string) => {
            const { error } = await osmium.DELETE("/api/v1/admin/training/progressions/{progression_id}", {
                params: { path: { progression_id: progressionId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "progressions"] });
        },
    });
}

// --- Progression steps ---

export function useTrainingProgressionSteps(query: { page?: number; pageSize?: number } = {}) {
    return useQuery({
        queryKey: ["osmium", "training", "progression-steps", "list", query.page, query.pageSize],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/training/progression-steps", {
                params: { query: { page: query.page, page_size: query.pageSize ?? 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface ProgressionStepInput {
    progression_id: string;
    lesson_id: string;
    sort_order: number;
    optional?: boolean;
}

export function useCreateTrainingProgressionStep() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: ProgressionStepInput) => {
            const { data, error } = await osmium.POST("/api/v1/admin/training/progression-steps", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "progression-steps"] });
        },
    });
}

export function useUpdateTrainingProgressionStep() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ stepId, body }: { stepId: string; body: { lesson_id?: string; sort_order?: number; optional?: boolean } }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/training/progression-steps/{step_id}", {
                params: { path: { step_id: stepId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "progression-steps"] });
        },
    });
}

export function useDeleteTrainingProgressionStep() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (stepId: string) => {
            const { error } = await osmium.DELETE("/api/v1/admin/training/progression-steps/{step_id}", {
                params: { path: { step_id: stepId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "progression-steps"] });
        },
    });
}

// --- Performance indicator templates / categories / criteria ---

export function usePerformanceIndicatorTemplates(query: { page?: number; pageSize?: number } = {}) {
    return useQuery({
        queryKey: ["osmium", "training", "pi-templates", "list", query.page, query.pageSize],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/training/performance-indicators/templates", {
                params: { query: { page: query.page, page_size: query.pageSize ?? 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreatePerformanceIndicatorTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: { name: string }) => {
            const { data, error } = await osmium.POST("/api/v1/admin/training/performance-indicators/templates", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "pi-templates"] });
        },
    });
}

export function useUpdatePerformanceIndicatorTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ templateId, body }: { templateId: string; body: { name: string } }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/training/performance-indicators/templates/{template_id}", {
                params: { path: { template_id: templateId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "pi-templates"] });
        },
    });
}

export function useDeletePerformanceIndicatorTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (templateId: string) => {
            const { error } = await osmium.DELETE("/api/v1/admin/training/performance-indicators/templates/{template_id}", {
                params: { path: { template_id: templateId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "pi-templates"] });
        },
    });
}

export function usePerformanceIndicatorCategories(query: { page?: number; pageSize?: number } = {}) {
    return useQuery({
        queryKey: ["osmium", "training", "pi-categories", "list", query.page, query.pageSize],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/training/performance-indicators/categories", {
                params: { query: { page: query.page, page_size: query.pageSize ?? 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreatePerformanceIndicatorCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: { template_id: string; name: string; sort_order: number }) => {
            const { data, error } = await osmium.POST("/api/v1/admin/training/performance-indicators/categories", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "pi-categories"] });
        },
    });
}

export function useUpdatePerformanceIndicatorCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ categoryId, body }: { categoryId: string; body: { name?: string; sort_order?: number } }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/training/performance-indicators/categories/{category_id}", {
                params: { path: { category_id: categoryId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "pi-categories"] });
        },
    });
}

export function useDeletePerformanceIndicatorCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (categoryId: string) => {
            const { error } = await osmium.DELETE("/api/v1/admin/training/performance-indicators/categories/{category_id}", {
                params: { path: { category_id: categoryId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "pi-categories"] });
        },
    });
}

export function usePerformanceIndicatorCriteria(query: { page?: number; pageSize?: number } = {}) {
    return useQuery({
        queryKey: ["osmium", "training", "pi-criteria", "list", query.page, query.pageSize],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/training/performance-indicators/criteria", {
                params: { query: { page: query.page, page_size: query.pageSize ?? 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreatePerformanceIndicatorCriteria() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: { category_id: string; name: string; sort_order: number }) => {
            const { data, error } = await osmium.POST("/api/v1/admin/training/performance-indicators/criteria", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "pi-criteria"] });
        },
    });
}

export function useUpdatePerformanceIndicatorCriteria() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ criteriaId, body }: { criteriaId: string; body: { name?: string; sort_order?: number } }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/training/performance-indicators/criteria/{criteria_id}", {
                params: { path: { criteria_id: criteriaId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "pi-criteria"] });
        },
    });
}

export function useDeletePerformanceIndicatorCriteria() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (criteriaId: string) => {
            const { error } = await osmium.DELETE("/api/v1/admin/training/performance-indicators/criteria/{criteria_id}", {
                params: { path: { criteria_id: criteriaId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "pi-criteria"] });
        },
    });
}

// --- Progression assignments ---

export function useProgressionAssignments(query: { page?: number; pageSize?: number } = {}) {
    return useQuery({
        queryKey: ["osmium", "training", "progression-assignments", "list", query.page, query.pageSize],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/training/progression-assignments", {
                params: { query: { page: query.page, page_size: query.pageSize ?? 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateProgressionAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: { user_id: string; progression_id: string }) => {
            const { data, error } = await osmium.POST("/api/v1/admin/training/progression-assignments", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "progression-assignments"] });
        },
    });
}

export function useDeleteProgressionAssignment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userId: string) => {
            const { error } = await osmium.DELETE("/api/v1/admin/training/progression-assignments/{user_id}", {
                params: { path: { user_id: userId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "progression-assignments"] });
        },
    });
}

// --- Per-controller progression status + force-complete ---

export function useUserProgression(cid: number | undefined) {
    return useQuery({
        queryKey: ["osmium", "users", "progression", cid],
        enabled: !!cid,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/users/{cid}/progression", {
                params: { path: { cid: cid! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useForceCompleteProgression(cid: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data, error } = await osmium.POST("/api/v1/users/{cid}/progression/complete", {
                params: { path: { cid } },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "users", "progression", cid] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "training", "progression-assignments"] });
        },
    });
}

// --- Dossier ---

export function useDossier(cid: number | undefined) {
    return useQuery({
        queryKey: ["osmium", "users", "dossier", cid],
        enabled: !!cid,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/users/{cid}/dossier", {
                params: { path: { cid: cid! }, query: { page_size: 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateDossierEntry(cid: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: { message: string; confidential?: boolean }) => {
            const { data, error } = await osmium.POST("/api/v1/users/{cid}/dossier", {
                params: { path: { cid } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "users", "dossier", cid] });
        },
    });
}
