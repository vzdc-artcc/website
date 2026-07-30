'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {Publication, useDeletePublication} from "@/lib/osmium/hooks/publications";

export default function FileDeleteButton({file}: { file: Pick<Publication, 'id' | 'title'> }) {
    const [clicked, setClicked] = useState(false);
    const deletePublication = useDeletePublication();

    const handleClick = async () => {
        if (clicked) {
            toast(`Deleting '${file.title}'...`, {type: 'info'});
            try {
                await deletePublication.mutateAsync(file.id);
                toast(`'${file.title}' deleted successfully!`, {type: 'success'});
            } catch {
                toast.error(`Failed to delete '${file.title}'.`);
            }
            setClicked(false);
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
