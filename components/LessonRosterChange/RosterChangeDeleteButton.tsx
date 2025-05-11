'use client';
import React, {useState} from 'react';
import {LessonRosterChange} from "@prisma/client";
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {deleteLessonRosterChange} from "@/actions/lessonRosterChange";

export default function RosterChangeDeleteButton({rosterChange}: { rosterChange: LessonRosterChange, }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteLessonRosterChange(rosterChange.id);
            toast(`Roster change deleted successfully!`, {type: 'success'});
        } else {
            toast(`Are you sure you want to delete this roster change.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <IconButton onClick={handleClick}>
            {clicked ? <Delete color="warning"/> : <Delete/>}
        </IconButton>
    );
}