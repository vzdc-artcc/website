'use client';

import {Button} from "@mui/material";
import {toast} from "react-toastify";
import {useUpdateEvent} from "@/lib/osmium/hooks/events";

interface EventLike {
    id: string;
    archived_at?: string | null;
    ends_at: string;
}

export default function ArchiveToggleButton({event}: { event: EventLike }) {

    const updateEvent = useUpdateEvent();
    const isArchived = !!event.archived_at;

    const handleClick = async () => {
        if (isArchived && new Date(event.ends_at) < new Date()) {
            toast.error('Cannot unarchive an event that has ended. If you really want to unarchive this event, please change the start and end times.');
            return;
        }
        try {
            await updateEvent.mutateAsync({eventId: event.id, body: {archived: !isArchived}});
        } catch {
            toast.error('Failed to update archive status.');
        }
    }

    return (
        <Button
            variant="outlined"
            color={isArchived ? 'info' : 'warning'}
            onClick={handleClick}>
            {isArchived ? 'Un-Archive' : 'Archive'}
        </Button>
    );
}
