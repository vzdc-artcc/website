'use client';

import {deleteEventPosition} from "@/actions/eventPosition";
import {Delete} from "@mui/icons-material";
import {IconButton, Tooltip} from "@mui/material";
import {Event, EventPosition} from "@/generated/prisma/browser";
import {useState} from "react";
import {toast} from "react-toastify";

export default function EventPositionDeleteButton({ event, position, }: { event: Event, position: EventPosition, }) {

    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteEventPosition(event, position.id, true);
            toast(`Position '${position.requestedPosition}' deleted successfully!`, {type: 'success'});
        } else {
            toast.warn(`Deleting this position will remove all signups associated with it.  Click again to confirm.`);
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete Position">
            <IconButton onClick={handleClick}>
                <Delete color={clicked ? 'warning' : 'inherit'} />
            </IconButton>
        </Tooltip>
    );

}