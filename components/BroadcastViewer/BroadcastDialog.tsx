'use client';
import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {ChangeBroadcast} from "@/generated/prisma/browser";
import {handleAgreeBroadcast, handleSeenBroadcast} from "@/actions/broadcastViewer";
import {User} from "next-auth";
import {Check} from "@mui/icons-material";

export default function BroadcastDialog({user, broadcasts, children}: {
    user: User,
    broadcasts: ChangeBroadcast[],
    children: React.ReactNode
}) {

    const [open, setOpen] = useState(true);

    const handleClose = () => {
        broadcasts.forEach((b) => handleSeenBroadcast(user, b.id));
        setOpen(false);
    }

    const handleAgree = () => {
        broadcasts.forEach((b) => handleAgreeBroadcast(user, b.id));
        setOpen(false);
    }

    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>{broadcasts.length > 1 ? 'Important Facility Broadcasts' : broadcasts[0].title}</DialogTitle>
            <DialogContent>
                {children}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">Save for Later</Button>
                <Button onClick={handleAgree} variant="contained" startIcon={<Check/>}>Reviewed</Button>
            </DialogActions>
        </Dialog>
    );
}