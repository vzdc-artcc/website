import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

export function useJobs() {
    return useQuery({
        queryKey: ["osmium", "jobs"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/jobs");
            if (error) throw error;
            return data;
        },
        refetchInterval: 60_000,
    });
}

export function useJobDetail(jobName: string) {
    return useQuery({
        queryKey: ["osmium", "jobs", jobName],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/jobs/{job_name}", {
                params: { path: { job_name: jobName } },
            });
            if (error) throw error;
            return data;
        },
        refetchInterval: 30_000,
    });
}

export function useRunJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (jobName: string) => {
            const { data, error } = await osmium.POST("/api/v1/admin/jobs/{job_name}/run", {
                params: { path: { job_name: jobName } },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, jobName) => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "jobs"] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "jobs", jobName] });
        },
    });
}
