'use client';
import React, {useState} from 'react';
import {FileCategory} from "@/generated/prisma/browser";
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {deleteFileCategory} from "@/actions/files";

export default function FileCategoryDeleteButton({fileCategory}: { fileCategory: FileCategory }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteFileCategory(fileCategory.id);
            toast(`'${fileCategory.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast(`This will delete all the files in this category.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <IconButton onClick={handleClick}>
            {clicked ? <Delete color="warning"/> : <Delete/>}
        </IconButton>
    );
}