'use client';
import React from 'react';
import {Box, Button, Divider, Stack, TextField} from "@mui/material";
import {Check, Clear} from "@mui/icons-material";
import {useDecideVisitorApplication} from "@/lib/osmium/hooks/visitor";
import {toast} from "react-toastify";

export default function VisitorApplicationDecisionForm({application}: {
    application: {id: string},
}) {

    const decideVisitorApplication = useDecideVisitorApplication();

    const handleAccept = async () => {
        try {
            await decideVisitorApplication.mutateAsync({applicationId: application.id, status: 'APPROVED'});
            toast("Controller added to roster successfully!", {type: "success"});
        } catch {
            toast("There was an unexpected error trying to add the controller to the visiting roster.", {type: "error"});
        }
    }

    const handleReject = async (formData: FormData) => {
        const reason = (formData.get("reason") as string || '').trim();
        if (!reason) {
            toast("A reason for rejection is required.", {type: "error"});
            return;
        }
        try {
            await decideVisitorApplication.mutateAsync({
                applicationId: application.id,
                status: 'DENIED',
                reasonForDenial: reason,
            });
            toast("Visitor rejected successfully", {type: "success"});
        } catch {
            toast("There was an unexpected error trying to reject the visiting request.", {type: "error"});
        }
    }

    return (
        <Stack direction={{xs: 'column', md: 'row'}} spacing={2} alignItems="center">
            <Box sx={{width: '100%',}}>
                <form action={handleReject}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField variant="filled" rows={4} fullWidth multiline name="reason"
                                   label="Reason for rejection" required/>
                        <Box>
                            <Button type="submit" variant="contained" size="large" color="error"
                                    startIcon={<Clear/>}>Reject</Button>
                        </Box>
                    </Stack>
                </form>
            </Box>
            <Divider orientation="vertical" flexItem/>
            <Box>
                <Button variant="contained" size="large" color="success" startIcon={<Check/>}
                        onClick={handleAccept}>Accept</Button>
            </Box>
        </Stack>
    );
}