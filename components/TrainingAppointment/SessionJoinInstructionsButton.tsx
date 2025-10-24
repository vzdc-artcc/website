'use client';
import React, {useState} from 'react';
import {TrainingAppointment} from "@prisma/client";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider} from "@mui/material";
import {formatZuluDate} from "@/lib/date";
import {Start} from "@mui/icons-material";
import Link from "next/link";

export default function SessionJoinInstructionsButton({trainingAppointment}: {
    trainingAppointment: TrainingAppointment,
}) {

    const [open, setOpen] = useState(false);

    return (
        <>
            {trainingAppointment.preparationCompleted &&
                <Button variant="contained" disabled={!trainingAppointment.preparationCompleted}
                        onClick={() => setOpen(true)} startIcon={<Start/>}>Join Session</Button>}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Session Join Instructions</DialogTitle>
                <DialogContent>
                    <DialogContentText gutterBottom>Join the vZDC TeamSpeak server prior to the session start
                        time: <b>{formatZuluDate(trainingAppointment.start)}</b>.</DialogContentText>
                    <DialogContentText gutterBottom>Once you are in the server, change your nickname to your <b>real
                        name</b> and set your TeamSpeak UID on this website. You will receive instructions in a DM from
                        our bot if you did not set your UID.</DialogContentText>
                    <DialogContentText gutterBottom>Join the &apos;<b>Training Waiting
                        Room</b>&apos; channel.</DialogContentText>
                    <DialogContentText gutterBottom>Wait for the trainer to move you into the designated training
                        channel.</DialogContentText>
                    <DialogContentText>Enjoy your session!</DialogContentText>
                    <Divider sx={{my: 2,}}/>
                    <Link href="/teamspeak" target="_blank" style={{color: 'inherit'}}>
                        <DialogContentText>vZDC Teamspeak Information</DialogContentText>
                    </Link>
                </DialogContent>
                <DialogActions>
                    <Button size="small" variant="outlined" color="inherit"
                            onClick={() => setOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );

}