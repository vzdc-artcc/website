'use client';

import React, {useState} from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@mui/material';
import {Event as EventIcon} from '@mui/icons-material';
import {toast} from 'react-toastify';
import {useQueueEventDiscordScheduledEvent} from '@/lib/osmium/hooks/events';
import {useRunOutboundJobs} from '@/lib/osmium/hooks/outbound-jobs';

/**
 * Creates a native Discord scheduled event (the server's Events tab) from this
 * event's details — separate from the event's website/Discord position postings.
 * Queues the outbound job and flushes the queue so it's created immediately.
 * Re-running replaces the previously-created Discord event.
 */
export default function EventDiscordEventButton({eventId}: { eventId: string }) {
    const [open, setOpen] = useState(false);
    const [location, setLocation] = useState('vatsim.net');
    const queue = useQueueEventDiscordScheduledEvent(eventId);
    const runJobs = useRunOutboundJobs();
    const busy = queue.isPending || runJobs.isPending;

    const handleCreate = async () => {
        try {
            await queue.mutateAsync(location.trim() || 'vatsim.net');
            await runJobs.mutateAsync();
            toast.success('Discord event created');
            setOpen(false);
        } catch {
            toast.error('Failed to create Discord event');
        }
    };

    return (
        <>
            <Button variant="outlined" color="secondary" startIcon={<EventIcon/>} onClick={() => setOpen(true)}>
                Post Discord Event
            </Button>
            <Dialog open={open} onClose={() => !busy && setOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Create Discord event</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{mb: 2}}>
                        Creates a Discord scheduled event from this event&apos;s title, description,
                        and start/end times. Re-running replaces the previous one.
                    </DialogContentText>
                    <TextField
                        fullWidth variant="filled" label="Location"
                        value={location} onChange={(e) => setLocation(e.target.value)}
                        disabled={busy}
                        helperText="Shown as the event location (external event)."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} disabled={busy} color="inherit">Cancel</Button>
                    <Button onClick={handleCreate} variant="contained" disabled={busy}>
                        {busy ? 'Creating…' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
