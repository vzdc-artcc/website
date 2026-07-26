'use client';
import React from 'react';
import {Delete} from "@mui/icons-material";
import {Button} from "@mui/material";
import {useDeleteSuaRequest} from "@/lib/osmium/hooks/sua";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function SuaRequestDeleteButton({suaRequest}: { suaRequest: {id: string} }) {

    const router = useRouter();
    const deleteSuaRequest = useDeleteSuaRequest();

    const handleDelete = async () => {
        try {
            await deleteSuaRequest.mutateAsync(suaRequest.id);
        } catch {
            toast.error("Failed to delete SUA request.");
            return;
        }
        toast.success("SUA request deleted successfully!");
        router.push('/');
    }

    return (
        <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<Delete/>}
            onClick={handleDelete}
        >Delete</Button>
    );
}