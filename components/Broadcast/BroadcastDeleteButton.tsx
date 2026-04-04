'use client';

import {Delete} from "@mui/icons-material";
import {Tooltip} from "@mui/material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {ChangeBroadcast} from "@/generated/prisma/browser";
import {useState} from "react";
import {toast} from "react-toastify";
import {deleteBroadcast} from "@/actions/broadcast";

export default function BroadcastDeleteButton({broadcast}: { broadcast: ChangeBroadcast }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteBroadcast(broadcast.id);
            toast(`Broadcast '${broadcast.title}' deleted successfully!`, {type: 'success'});
        } else {
            toast.warn(`Deleting this broadcast will remove it from all selected users.  Click again to confirm.`);
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete Broadcast">
            <GridActionsCellItem
                icon={<Delete color={clicked ? "warning" : "inherit"}/>}
                label="Delete Broadcast"
                onClick={handleClick}
            />
        </Tooltip>
    );
}