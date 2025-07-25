'use client';
import React from 'react';
import {SuaBlock} from "@prisma/client";
import {Delete} from "@mui/icons-material";
import {Button} from "@mui/material";
import {deleteSuaRequest} from "@/actions/sua";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function SuaRequestDeleteButton({suaRequest}: { suaRequest: SuaBlock }) {

    const router = useRouter();

    const handleDelete = async () => {
        await deleteSuaRequest(suaRequest.id);
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