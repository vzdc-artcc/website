'use client';

import {Delete} from "@mui/icons-material";
import {IconButton, Tooltip} from "@mui/material";
import {useState} from "react";
import {toast} from "react-toastify";
import {useDeleteEventPosition} from "@/lib/osmium/hooks/events";

export default function EventPositionDeleteButton({eventId, position}: {
    eventId: string,
    position: { id: string, requested_position?: string | null },
}) {

    const [clicked, setClicked] = useState(false);
    const deletePosition = useDeleteEventPosition(eventId);

    const handleClick = async () => {
        if (clicked) {
            await deletePosition.mutateAsync(position.id);
            toast(`Position '${position.requested_position}' deleted successfully!`, {type: 'success'});
        } else {
            toast.warn(`Deleting this position will remove all signups associated with it.  Click again to confirm.`);
            setClicked(true);
        }
    }

    return (
        <Tooltip title="Delete Position">
            <IconButton onClick={handleClick}>
                <Delete color={clicked ? 'warning' : 'inherit'}/>
            </IconButton>
        </Tooltip>
    );

}
