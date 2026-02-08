'use client';
import React from 'react';
import {StaffingRequest} from "@prisma/client";
import StaffingRequestDecisionButton from "@/components/StaffingRequest/StaffingRequestDecisionButton";
import {Typography} from "@mui/material";
import Link from "next/link";
import {closeStaffingRequest} from "@/actions/staffingRequest";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";

function StaffingRequestDecisionForm({staffingRequest}: { staffingRequest: StaffingRequest, }) {

    const router = useRouter();

    const handleSubmit = async () => {
        await closeStaffingRequest(staffingRequest);
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
