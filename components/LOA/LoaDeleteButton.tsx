'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {Button, Tooltip} from "@mui/material";
import {Delete, Storage} from "@mui/icons-material";
import {useCancelLoa, useDecideLoa} from "@/lib/osmium/hooks/loa";
import {GridActionsCellItem} from "@mui/x-data-grid";

interface LoaLike {
    id: string;
    status: string;
}

export default function LoaDeleteButton({loa, icon, admin}: { loa: LoaLike, icon?: boolean, admin?: boolean, }) {
    const [clicked, setClicked] = useState(false);
    const cancelLoa = useCancelLoa();
    const decideLoa = useDecideLoa();

    const handleClick = async () => {
        if (clicked) {
            try {
                if (admin) {
                    await decideLoa.mutateAsync({loaId: loa.id, status: 'INACTIVE'});
                } else {
                    await cancelLoa.mutateAsync(loa.id);
                }
            } catch {
                toast(`Failed to close LOA.`, {type: 'error'});
                return;
            }
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
                    disabled={loa.status === 'INACTIVE'}
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