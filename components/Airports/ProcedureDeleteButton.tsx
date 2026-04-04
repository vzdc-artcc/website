'use client';
import React, {useState} from 'react';
import {RunwayInstruction} from "@/generated/prisma/browser";
import {deleteProcedure} from "@/actions/airports";
import {toast} from "react-toastify";
import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";

export default function ProcedureDeleteButton({instruction}: { instruction: RunwayInstruction }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteProcedure(instruction.id);
            toast(`Procedure '${instruction.route}' deleted successfully`, {type: 'success'});
        } else {
            toast(`Are you sure you want to delete procedure '${instruction.route}'?  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete">
            <IconButton onClick={handleClick}>
                {clicked ? <Delete color="warning"/> : <Delete/>}
            </IconButton>
        </Tooltip>
    );
}