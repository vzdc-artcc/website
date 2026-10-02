'use client';
import React, {useState} from 'react';
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {toast} from "react-toastify";
import {InnovationLabProject} from "@/generated/prisma/browser";
import {deleteInnovationLabProject} from "@/actions/innovation";

export default function InnovationLabDeleteButton({project}: { project: InnovationLabProject }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteInnovationLabProject(project.id);
            toast(`'${project.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast(`This will permanently delete the project.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <IconButton onClick={handleClick}>
            {clicked ? <Delete color="warning"/> : <Delete/>}
        </IconButton>
    );
}