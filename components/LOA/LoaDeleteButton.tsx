'use client';
import React, {useState} from 'react';
import {LOA, LOAStatus} from "@/generated/prisma/browser";
import {toast} from "react-toastify";
import {Button, Tooltip} from "@mui/material";
import {Delete, Storage} from "@mui/icons-material";
import {deleteLoa} from "@/actions/loa";
import {GridActionsCellItem} from "@mui/x-data-grid";

export default function LoaDeleteButton({loa, icon}: { loa: LOA, icon?: boolean, }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteLoa(loa.id);
            toast(`LOA deleted successfully!`, {type: 'success'});
        } else {
            toast(`Are you sure you want to mark this LOA as inactive? This action is irreversible! Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    if (icon) {
        return (
            <Tooltip title="Close LOA">
                <GridActionsCellItem
                    disabled={loa.status === LOAStatus.INACTIVE}
                    icon={clicked ? <Storage color="warning"/> : <Storage/>}
                    label="Close LOA"
                    onClick={handleClick}
                />
            </Tooltip>
        );
    }

    return (
        <Button variant="outlined" color="inherit" onClick={handleClick}
                startIcon={clicked ? <Delete color="warning"/> : <Delete/>}>
            Close LOA
        </Button>
    );
}