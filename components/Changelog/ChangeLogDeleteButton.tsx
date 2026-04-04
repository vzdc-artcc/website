'use client';
import React, {useState} from 'react';
import {Version} from "@/generated/prisma/browser";
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {deleteChangeLog} from '@/actions/changeLog';

export default function TrainingSessionDeleteButton({changeLog}: { changeLog: Version, }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteChangeLog(changeLog.id);
            toast(`Change log deleted successfully!`, {type: 'success'});
        } else {
            toast(`Deleting this remove it from all records.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <IconButton onClick={handleClick}>
            {clicked ? <Delete color="warning"/> : <Delete/>}
        </IconButton>
    );
}