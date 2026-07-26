'use client';

import {Delete} from "@mui/icons-material";
import {Tooltip} from "@mui/material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {useState} from "react";
import {toast} from "react-toastify";
import {useDeleteBroadcast} from "@/lib/osmium/hooks/broadcasts";

export default function BroadcastDeleteButton({broadcast}: { broadcast: { id: string, title: string } }) {
    const [clicked, setClicked] = useState(false);
    const deleteBroadcast = useDeleteBroadcast();

    const handleClick = async () => {
        if (clicked) {
            await deleteBroadcast.mutateAsync(broadcast.id);
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
