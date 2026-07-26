'use client';
import React, {useEffect, useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import {Save} from "@mui/icons-material";
import {toast} from "react-toastify";
import {useMe} from "@/lib/osmium/hooks/me";
import {useCreateMyTeamspeakUid, useDeleteMyTeamspeakUid} from "@/lib/osmium/hooks/me";

export default function TeamspeakUidDialog({open, onClose}: { open: boolean, onClose: () => void }) {

    const {data: me} = useMe({enabled: open});
    const createUid = useCreateMyTeamspeakUid();
    const deleteUid = useDeleteMyTeamspeakUid();

    const existing = me?.teamspeak_uids[0];
    const [uid, setUid] = useState('');

    useEffect(() => {
        setUid(existing?.uid || '');
    }, [existing?.uid]);

    const handleSave = async () => {
        try {
            if (existing) {
                await deleteUid.mutateAsync(existing.id);
            }
            if (uid.length > 0) {
                await createUid.mutateAsync(uid);
            }
        } catch {
            toast.error('Failed to save TeamSpeak I.D.');
            return;
        }

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
                    To find your TeamSpeak Unique I.D., open TeamSpeak and click on the &quot;Connections&quot; menu,
                    then select
                    &quot;Connect&quot;.
                    In the &quot;Server Nickname or Address&quot; field, enter the address of our TeamSpeak server.
                    Click on the &quot;Connect&quot; button, and once you are connected, click on
                    the &quot;Tools&quot; menu, then select
                    &quot;Identities&quot;.
                    In the &quot;Identities&quot; menu, you will see your Unique I.D. listed under &quot;Unique
                    ID&quot;.
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
