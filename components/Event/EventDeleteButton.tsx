'use client';

import {Delete} from "@mui/icons-material";
import {Tooltip} from "@mui/material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {useState} from "react";
import {toast} from "react-toastify";
import {useDeleteEvent} from "@/lib/osmium/hooks/events";

export default function EventDeleteButton({event}: { event: { id: string, title: string } }) {
    const [clicked, setClicked] = useState(false);
    const deleteEvent = useDeleteEvent();

    const handleClick = async () => {
        if (clicked) {
            try {
                await deleteEvent.mutateAsync(event.id);
            } catch {
                toast(`Failed to delete event.`, {type: 'error'});
                return;
            }
            toast(`Event '${event.title}' deleted successfully!`, {type: 'success'});
        } else {
            toast.warn(`Deleting this event will remove all positions and signups associated with it.  Click again to confirm.`);
            setClicked(true);
        }
    }

    return (
        <Tooltip title="Delete Event">
            <GridActionsCellItem
                disabled={deleteEvent.isPending}
                icon={<Delete color={clicked ? "warning" : "inherit"}/>}
                label="Delete Event"
                onClick={handleClick}
            />
        </Tooltip>
    );
}
