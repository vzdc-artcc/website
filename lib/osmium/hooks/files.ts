import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium, osmiumBaseUrl } from "@/lib/osmium/client";

/**
 * Paginated list of file assets the caller can see (`GET /api/v1/files`).
 * Backs the Website Management file manager. `page` is 1-based.
 */
export function useFiles(page: number, pageSize: number) {
    return useQuery({
        queryKey: ["osmium", "files", { page, pageSize }],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/files", {
                params: { query: { page, page_size: pageSize } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useDeleteFile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (fileId: string) => {
            const { data, error } = await osmium.DELETE("/api/v1/files/{file_id}", {
                params: { path: { file_id: fileId } },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "files"] });
        },
    });
}

interface UploadFileInput {
    file: File;
    public?: boolean;
}

interface UploadedFileAsset {
    id: string;
    filename: string;
    content_type: string;
    size_bytes: number;
    is_public: boolean;
}

export function useUploadFile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ file, public: isPublic }: UploadFileInput): Promise<UploadedFileAsset> => {
            const params = new URLSearchParams({ filename: file.name });
            if (isPublic !== undefined) {
                params.set("public", String(isPublic));
            }

            const res = await fetch(`${osmiumBaseUrl}/api/v1/files?${params.toString()}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": file.type || "application/octet-stream",
                },
                body: file,
            });

            if (!res.ok) {
                throw new Error(`File upload failed with status ${res.status}`);
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "files"] });
        },
    });
}

interface ImportFileFromUrlInput {
    url: string;
    filename?: string;
    public?: boolean;
}

export function useImportFileFromUrl() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ url, filename, public: isPublic }: ImportFileFromUrlInput) => {
            const { data, error } = await osmium.POST("/api/v1/files/import", {
                params: { query: { public: isPublic } },
                body: { url, filename },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "files"] });
        },
    });
}
