'use client';
import React from 'react';
import {LOA} from "@/generated/prisma/browser";
import {Button, Stack} from "@mui/material";
import {Check, Close} from "@mui/icons-material";
import {approveLoa, denyLoa} from "@/actions/loa";
import {toast} from "react-toastify";

export default function LoaDecisionForm({loa}: { loa: LOA, }) {

    const handleApprove = async () => {
        const result = await approveLoa(loa.id);
        if (result.loa) {
            toast("LOA Approved", {type: "success"});
        }
    }

    const handleDeny = async () => {
        const result = await denyLoa(loa.id);
        if (result.loa) {
            toast("LOA Denied", {type: "success"});
        }
    }

    return (
        <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
            <Button variant="contained" size="large" color="success" startIcon={<Check/>}
                    onClick={handleApprove}>Approve</Button>
            <Button variant="contained" size="large" color="error" startIcon={<Close/>}
                    onClick={handleDeny}>Deny</Button>
        </Stack>
    );
}