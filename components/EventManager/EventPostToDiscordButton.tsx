'use client';

import React, {useState} from 'react';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
} from '@mui/material';
import {Send} from '@mui/icons-material';
import {toast} from 'react-toastify';
import {useQueueEventDiscordPublish} from '@/lib/osmium/hooks/events';
import {useRunOutboundJobs} from '@/lib/osmium/hooks/outbound-jobs';

/**
 * Posts an event's published positions to the Discord event channel
 * (`event_position_posting`). Queues the outbound job and immediately flushes the
 * outbound queue so it delivers now rather than waiting for a manual run.
 */
export default function EventPostToDiscordButton({eventId}: { eventId: string }) {
    const [open, setOpen] = useState(false);
    const [ping, setPing] = useState(false);
    const queuePublish = useQueueEventDiscordPublish(eventId);
    const runJobs = useRunOutboundJobs();
    const busy = queuePublish.isPending || runJobs.isPending;

    const handlePost = async () => {
        try {
            await queuePublish.mutateAsync(ping);
            await runJobs.mutateAsync();
            toast.success('Event posted to Discord');
            setOpen(false);
        } catch {
            toast.error('Failed to post event to Discord');
        }
    };

    return (
        <>
            <Button variant="outlined" color="secondary" startIcon={<Send/>} onClick={() => setOpen(true)}>
                Post to Discord
            </Button>
            <Dialog open={open} onClose={() => !busy && setOpen(false)}>
                <DialogTitle>Post event to Discord</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{mb: 2}}>
                        Posts this event and its published positions to the Discord event
                        channel. Make sure positions are published first.
                    </DialogContentText>
                    <FormControlLabel
                        control={<Checkbox checked={ping} disabled={busy}
                                           onChange={(e) => setPing(e.target.checked)}/>}
                        label="Ping assigned controllers"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} disabled={busy} color="inherit">Cancel</Button>
                    <Button onClick={handlePost} variant="contained" disabled={busy}>
                        {busy ? 'Posting…' : 'Post'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
