'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {useDeleteSoloCertification} from "@/lib/osmium/hooks/certifications";

export default function SoloCertificationDeleteButton({soloCertification,}: { soloCertification: { id: string } }) {
    const [clicked, setClicked] = useState(false);
    const deleteSolo = useDeleteSoloCertification();

    const handleClick = async () => {
        if (clicked) {
            try {
                await deleteSolo.mutateAsync(soloCertification.id);
                toast(`Solo deleted successfully!`, {type: 'success'});
            } catch {
                toast('Failed to delete solo endorsement.', {type: 'error'});
            }
            setClicked(false);
        } else {
            toast(`Deleting this will revoke the solo from VATUSA and locally.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }
    }

    return (
        <Tooltip title="Delete Solo Endorsement">
            <GridActionsCellItem
                icon={<Delete color={clicked ? "warning" : "inherit"}/>}
                label="Delete Solo Endorsement"
                onClick={handleClick}
            />
        </Tooltip>
    );
}
