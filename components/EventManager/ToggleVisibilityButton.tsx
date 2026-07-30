'use client';

import {Button} from "@mui/material";
import {toast} from "react-toastify";
import {useUpdateEvent} from "@/lib/osmium/hooks/events";

interface EventLike {
    id: string;
    hidden: boolean;
    archived_at?: string | null;
}

export default function ToggleVisibilityButton({event}: { event: EventLike }) {

    const updateEvent = useUpdateEvent();

    const handleClick = async () => {
        try {
            await updateEvent.mutateAsync({eventId: event.id, body: {hidden: !event.hidden}});
        } catch {
            toast.error('Failed to update visibility.');
        }
    }

    return (
        <Button variant={event.hidden ? 'contained' : 'outlined'} color={event.hidden ? 'success' : 'error'}
                onClick={handleClick} disabled={!!event.archived_at}>
            {event.hidden ? 'Show' : 'Hide'}
        </Button>
    );
}
