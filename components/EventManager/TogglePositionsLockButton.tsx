'use client';

import {Button} from "@mui/material";
import {useSetPositionsLocked} from "@/lib/osmium/hooks/events";
import {toast} from "react-toastify";

export default function TogglePositionsLockButton({event}: {
    event: { id: string, positions_locked: boolean, archived_at?: string | null, hidden: boolean }
}) {
    const setLocked = useSetPositionsLocked(event.id);

    const handleClick = async () => {
        try {
            await setLocked.mutateAsync(!event.positions_locked);
        } catch {
            toast.error('Failed to update lock state.');
        }
    }

    return (
        <Button variant={event.positions_locked ? 'contained' : 'outlined'}
                color={event.positions_locked ? 'secondary' : 'error'} onClick={handleClick}
                disabled={!!event.archived_at || event.hidden}>
            {event.positions_locked ? 'Unlock' : 'Lock'}
        </Button>
    );
}
