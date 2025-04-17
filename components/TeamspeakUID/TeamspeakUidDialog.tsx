'use client';
import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import {Save} from "@mui/icons-material";
import {toast} from "react-toastify";
import {User} from "next-auth";
import {updateTeamspeakUid} from "@/actions/profile";

export default function TeamspeakUidDialog({user, open, onClose}: { user: User, open: boolean, onClose: () => void }) {

    const [uid, setUid] = useState(user.teamspeakUid || '');

    const handleSave = async () => {
        await updateTeamspeakUid(user, uid);
        if (uid.length < 1) {
            toast.success('Teamspeak I.D. removed successfully!  Please wait a few minutes for the change to take effect.');
        } else {
            toast.success('Teamspeak I.D. saved successfully!  Please wait a few minutes for the change to take effect.');
        }
        onClose();
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>TeamSpeak Unique I.D.</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Your TeamSpeak Unique I.D. is a unique identifier that is used to link your VATSIM account with your
                    TeamSpeak account.
                    This allows us to provide you with a better experience on our TeamSpeak server.
                </DialogContentText>
                <br/>
                <DialogContentText>
                    To find your TeamSpeak Unique I.D., open TeamSpeak and click on the "Connections" menu, then select
                    "Connect".
                    In the "Server Nickname or Address" field, enter the address of our TeamSpeak server.
                    Click on the "Connect" button, and once you are connected, click on the "Tools" menu, then select
                    "Identities".
                    In the "Identities" menu, you will see your Unique I.D. listed under "Unique ID".
                </DialogContentText>
                <br/>
                <DialogContentText>
                    <b>There might be multiple identities configured in TeamSpeak. Use the one you will connect to our
                        TeamSpeak server with.</b>
                </DialogContentText>
                <br/>
                <TextField fullWidth variant="filled" label="TeamSpeak Unique I.D." value={uid}
                           onChange={(e) => setUid(e.target.value.trim())}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Close</Button>
                <Button onClick={handleSave} variant="contained" startIcon={<Save/>}>Save</Button>
            </DialogActions>
        </Dialog>

    );
}