'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useDeletePublicationCategory} from "@/lib/osmium/hooks/publications";
import {categoryErrorMessage} from "@/components/Files/categoryErrorMessage";

export default function FileCategoryDeleteButton({fileCategory}: { fileCategory: { id: string; name: string } }) {
    const [clicked, setClicked] = useState(false);
    const deleteCategory = useDeletePublicationCategory();

    const handleClick = async () => {
        if (clicked) {
            try {
                await deleteCategory.mutateAsync(fileCategory.id);
                toast(`'${fileCategory.name}' deleted successfully!`, {type: 'success'});
            } catch (error) {
                toast.error(categoryErrorMessage(error, `Failed to delete '${fileCategory.name}'.`));
            }
            setClicked(false);
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
