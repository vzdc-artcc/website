'use client';
import React, {useState} from 'react';
import {WelcomeMessages} from "@prisma/client";
import {User} from "next-auth";
import {Box, Button, Dialog, DialogActions, DialogContent, Typography} from "@mui/material";
import Markdown from "react-markdown";
import {Check} from "@mui/icons-material";
import {acknowledgeWelcomeMessage} from "@/actions/welcome-messages";
import Logo from "@/components/Logo/Logo";

export default function WelcomeMessageDialog({user, welcomeMessages}: {
    user: User,
    welcomeMessages: WelcomeMessages
}) {

    const [open, setOpen] = useState(user.showWelcomeMessage);

    if (user.controllerStatus !== 'HOME' && user.controllerStatus !== 'VISITOR') {
        return <></>; // Do not show dialog if user is not HOME or VISITOR
    }

    const onClose = async () => {
        setOpen(false);
        await acknowledgeWelcomeMessage(user.id);
    }

    return (
        <Dialog open={open} maxWidth="md" fullWidth>
            <DialogContent>
                <Box sx={{textAlign: 'center', mb: 1,}}>
                    <Logo/>
                </Box>
                <Typography textAlign="center" variant="h5" gutterBottom>Welcome to the Virtual Washington
                    ARTCC!</Typography>
                {user.controllerStatus === 'HOME' ? <Markdown>{welcomeMessages.homeText}</Markdown> : <></>}
                {user.controllerStatus === 'VISITOR' ? <Markdown>{welcomeMessages.visitorText}</Markdown> : <></>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" size="small" startIcon={<Check/>}>Get Started</Button>
            </DialogActions>
        </Dialog>
    );
}