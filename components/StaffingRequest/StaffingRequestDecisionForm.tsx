'use client';
import React from 'react';
import StaffingRequestDecisionButton from "@/components/StaffingRequest/StaffingRequestDecisionButton";
import {Typography} from "@mui/material";
import Link from "next/link";
import {useDeleteStaffingRequest} from "@/lib/osmium/hooks/staffing";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";

function StaffingRequestDecisionForm({staffingRequest}: { staffingRequest: {id: string}, }) {

    const router = useRouter();
    const deleteStaffingRequest = useDeleteStaffingRequest();

    const handleSubmit = async () => {
        try {
            await deleteStaffingRequest.mutateAsync(staffingRequest.id);
        } catch {
            toast("Failed to close staffing request.", {type: "error",});
            return;
        }
        router.replace("/events/admin/staffing-requests");
        toast("Staffing request closed successfully!", {type: "success",});
    }

    return (
        <form action={handleSubmit}>
            <StaffingRequestDecisionButton/>
            <Typography fontWeight="bold" sx={{mt: 1,}}>This will delete the staffing request permanently.</Typography>
            <Typography>Create a new event <Link href="/events/admin/events/new" target="_blank"
                                                 style={{color: 'inherit',}}>here.</Link></Typography>
        </form>
    );
}

export default StaffingRequestDecisionForm;
