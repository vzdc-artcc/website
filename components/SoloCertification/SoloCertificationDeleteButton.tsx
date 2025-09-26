'use client';
import React, {useState} from 'react';
import {SoloCertification} from "@prisma/client";
import {toast} from "react-toastify";
import {Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {deleteSolo} from "@/actions/solo";
import {GridActionsCellItem} from "@mui/x-data-grid";

export default function SoloCertificationDeleteButton({soloCertification,}: { soloCertification: SoloCertification }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteSolo(soloCertification.id);
            toast(`Solo deleted successfully!`, {type: 'success'});
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