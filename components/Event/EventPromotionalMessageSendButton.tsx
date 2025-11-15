'use client';
import React, {useState} from 'react';
import {Event} from "@prisma/client";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {Campaign, Send} from "@mui/icons-material";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Tooltip
} from "@mui/material";
import MarkdownEditor from "@uiw/react-markdown-editor";
import {toast} from "react-toastify";
import {sendEventPromotionalMessage} from "@/actions/discord";

export default function EventPromotionalMessageSendButton({event}: { event: Event }) {

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    const onSubmit = async () => {
        setLoading(true);
        if (!title || !body) {
            toast.error('Title and Body are required.');
            setLoading(false);
            return;
        }

        const success = await sendEventPromotionalMessage(title, body, event.bannerKey || '');
        setLoading(false);
        if (success) {
            toast.success('Promotional message sent successfully.');
            setOpen(false);
        } else {
            toast.error('Failed to send promotional message.');
        }
    }

    return (
        <>
            <Tooltip title="Send Promotional Message">
                <GridActionsCellItem
                    icon={<Campaign/>}
                    label="Send Promotional Message"
                    onClick={() => setOpen(true)}
                />
            </Tooltip>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Send Event Promotional Message</DialogTitle>
                <DialogContent>
                    <DialogContentText>{event.name}</DialogContentText>
                    <TextField sx={{my: 2,}} fullWidth variant="filled" label="Title" value={title}
                               onChange={(e) => setTitle(e.target.value)} required/>
                    <MarkdownEditor
                        enableScroll={false}
                        minHeight="400px"
                        value={body}
                        onChange={(b) => setBody(b)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" size="small" onClick={() => setOpen(false)}
                            disabled={loading}>Cancel</Button>
                    <Button variant="contained" color="primary" size="small" onClick={onSubmit} startIcon={<Send/>}
                            disabled={loading}>Send</Button>
                </DialogActions>
            </Dialog>
        </>
    );

}