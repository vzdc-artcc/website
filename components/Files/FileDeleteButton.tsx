'use client';
import React, {useState} from 'react';
import {File} from "@/generated/prisma/browser";
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {deleteFile} from "@/actions/files";

export default function FileDeleteButton({file}: { file: File }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            toast(`Deleting '${file.name}'...`, {type: 'info'});
            await deleteFile(file.id);
            toast(`'${file.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast(`This action is permanent.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <IconButton onClick={handleClick}>
            {clicked ? <Delete color="warning"/> : <Delete/>}
        </IconButton>
    );
}