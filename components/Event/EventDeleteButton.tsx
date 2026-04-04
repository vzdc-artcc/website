'use client';

import {deleteEvent} from "@/actions/event";
import {Delete} from "@mui/icons-material";
import {Tooltip} from "@mui/material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {Event} from "@/generated/prisma/browser";
import {useState} from "react";
import {toast} from "react-toastify";

export default function EventDeleteButton({ event }: { event: Event }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteEvent(event.id);
            toast(`Event '${event.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast.warn(`Deleting this event will remove all positions and signups associated with it.  Click again to confirm.`);
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete Event">
            <GridActionsCellItem
                icon={<Delete color={clicked ? "warning" : "inherit"}/>}
                label="Delete Event"
                onClick={handleClick}
            />
        </Tooltip>
    );
}