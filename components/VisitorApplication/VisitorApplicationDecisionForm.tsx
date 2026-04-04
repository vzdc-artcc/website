'use client';
import React from 'react';
import {VisitorApplication} from "@/generated/prisma/browser";
import {Box, Button, Divider, Stack, TextField} from "@mui/material";
import {Check, Clear} from "@mui/icons-material";
import {addVisitor, rejectVisitor} from "@/actions/visitor";
import {toast} from "react-toastify";
import {User} from "next-auth";

export default function VisitorApplicationDecisionForm({application, user}: {
    application: VisitorApplication,
    user: User,
}) {

    const handleAccept = async () => {
        try {
            await addVisitor(application, user);
            toast("Controller added to roster successfully!", {type: "success"});
        } catch (e) {
            toast("There was an unexpected error trying to add the controller to the visiting roster.", {type: "error"});
        }
    }

    const handleReject = async (formData: FormData) => {
        try {
            await rejectVisitor({...application, reasonForDenial: formData.get("reason") as string}, user);
            toast("Visitor rejected successfully", {type: "success"});
        } catch (e) {
            toast("There was an unexpected error trying to reject the visiting request.", {type: "error"});
        }
    }

    return (
        <Stack direction={{xs: 'column', md: 'row'}} spacing={2} alignItems="center">
            <Box sx={{width: '100%',}}>
                <form action={handleReject}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField variant="filled" rows={4} fullWidth multiline name="reason"
                                   label="Reason for rejection"
                                   helperText="A reason is not required, but is highly encouraged"/>
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