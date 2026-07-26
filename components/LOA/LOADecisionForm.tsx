'use client';
import React from 'react';
import {Button, Stack} from "@mui/material";
import {Check, Close} from "@mui/icons-material";
import {useDecideLoa} from "@/lib/osmium/hooks/loa";
import {toast} from "react-toastify";

export default function LoaDecisionForm({loa}: { loa: {id: string}, }) {

    const decideLoa = useDecideLoa();

    const handleApprove = async () => {
        try {
            await decideLoa.mutateAsync({loaId: loa.id, status: 'APPROVED'});
            toast("LOA Approved", {type: "success"});
        } catch {
            toast("Failed to approve LOA.", {type: "error"});
        }
    }

    const handleDeny = async () => {
        try {
            await decideLoa.mutateAsync({loaId: loa.id, status: 'DENIED'});
            toast("LOA Denied", {type: "success"});
        } catch {
            toast("Failed to deny LOA.", {type: "error"});
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