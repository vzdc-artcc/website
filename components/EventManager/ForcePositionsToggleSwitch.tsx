'use client';
import {FormControlLabel, Switch} from "@mui/material";
import {useUpdateEvent} from "@/lib/osmium/hooks/events";
import {toast} from "react-toastify";

export default function ForcePositionsToggleSwitch({event}: {
    event: { id: string, manual_positions_open: boolean, archived_at?: string | null }
}) {
    const updateEvent = useUpdateEvent();

    const handleChange = async () => {
        try {
            await updateEvent.mutateAsync({eventId: event.id, body: {manual_positions_open: !event.manual_positions_open}});
        } catch {
            toast.error('Failed to update setting.');
        }
    }

    return (
        <FormControlLabel
            control={
                <Switch
                    checked={event.manual_positions_open}
                    disabled={!!event.archived_at}
                    onChange={handleChange}
                />
            }
            label="Force Positions Lock Setting? (no auto close)"
        />
    );
}
