'use client';
import React, {useEffect, useState} from 'react';
import {Box, Button, Dialog, DialogActions, DialogContent, Typography} from "@mui/material";
import Markdown from "react-markdown";
import {Check} from "@mui/icons-material";
import {useAcknowledgeWelcomeMessage, useMyWelcomeMessage} from "@/lib/osmium/hooks/welcome-messages";
import Logo from "@/components/Logo/Logo";

export default function WelcomeMessageDialog() {

    const {data} = useMyWelcomeMessage();
    const acknowledgeWelcomeMessage = useAcknowledgeWelcomeMessage();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (data?.show && data?.text) {
            setOpen(true);
        }
    }, [data]);

    const onClose = async () => {
        setOpen(false);
        await acknowledgeWelcomeMessage.mutateAsync();
    }

    if (!data?.show || !data?.text) {
        return null;
    }

    return (
        <Dialog open={open} maxWidth="md" fullWidth>
            <DialogContent>
                <Box sx={{textAlign: 'center', mb: 1,}}>
                    <Logo/>
                </Box>
                <Typography textAlign="center" variant="h5" gutterBottom>Welcome to the Virtual Washington
                    ARTCC!</Typography>
                <Markdown>{data.text}</Markdown>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" size="small" startIcon={<Check/>}>Get Started</Button>
            </DialogActions>
        </Dialog>
    );
}
