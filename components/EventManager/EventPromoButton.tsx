'use client';

import React, {useState} from 'react';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack,
    TextField,
} from '@mui/material';
import {Campaign} from '@mui/icons-material';
import {toast} from 'react-toastify';
import {useQueueAnnouncement, useRunOutboundJobs} from '@/lib/osmium/hooks/outbound-jobs';

/**
 * Sends a promotional announcement for an event via the announcement flow
 * (Discord `announcements` channel and/or email). Queues the outbound job(s) and
 * flushes the queue so it delivers immediately. Pre-fills the title and a link
 * back to the event page; the operator writes the promo body.
 */
export default function EventPromoButton({eventId, eventTitle}: { eventId: string, eventTitle: string }) {
    const queueAnnouncement = useQueueAnnouncement();
    const runJobs = useRunOutboundJobs();

    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [detailsUrl, setDetailsUrl] = useState('');
    const [sendDiscord, setSendDiscord] = useState(true);
    const [sendEmail, setSendEmail] = useState(false);

    const busy = queueAnnouncement.isPending || runJobs.isPending;
    const valid = title.trim() !== '' && body.trim() !== '' && (sendDiscord || sendEmail);

    const openDialog = () => {
        // Reset + prefill each time so edits from a prior open don't linger.
        setTitle(eventTitle);
        setBody('');
        setDetailsUrl(
            typeof window !== 'undefined' ? `${window.location.origin}/events/${eventId}` : '',
        );
        setSendDiscord(true);
        setSendEmail(false);
        setOpen(true);
    };

    const handleSend = async () => {
        try {
            await queueAnnouncement.mutateAsync({
                title: title.trim(),
                body_markdown: body,
                details_url: detailsUrl.trim() || undefined,
                send_discord: sendDiscord,
                send_email: sendEmail,
                // Event promos go to the dedicated event-announcements channel,
                // not the general announcements channel.
                channel: 'event_announcements',
            });
            await runJobs.mutateAsync();
            toast.success('Promotional message sent');
            setOpen(false);
        } catch {
            toast.error('Failed to send promotional message');
        }
    };

    return (
        <>
            <Button variant="outlined" color="secondary" startIcon={<Campaign/>} onClick={openDialog}>
                Send Promo
            </Button>
            <Dialog open={open} onClose={() => !busy && setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Send promotional message</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 1}}>
                        <TextField
                            required fullWidth variant="filled" label="Title"
                            value={title} onChange={(e) => setTitle(e.target.value)} disabled={busy}
                        />
                        <TextField
                            required fullWidth multiline minRows={4} variant="filled"
                            label="Message (Markdown)"
                            value={body} onChange={(e) => setBody(e.target.value)} disabled={busy}
                        />
                        <TextField
                            fullWidth variant="filled" label="Details URL (optional)"
                            value={detailsUrl} onChange={(e) => setDetailsUrl(e.target.value)} disabled={busy}
                        />
                        <Stack direction="row" spacing={2}>
                            <FormControlLabel
                                control={<Checkbox checked={sendDiscord} disabled={busy}
                                                   onChange={(e) => setSendDiscord(e.target.checked)}/>}
                                label="Send to Discord"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={sendEmail} disabled={busy}
                                                   onChange={(e) => setSendEmail(e.target.checked)}/>}
                                label="Send Email"
                            />
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} disabled={busy} color="inherit">Cancel</Button>
                    <Button onClick={handleSend} variant="contained" disabled={busy || !valid}>
                        {busy ? 'Sending…' : 'Send'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
