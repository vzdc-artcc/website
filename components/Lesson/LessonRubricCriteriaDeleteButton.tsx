'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useDeleteLessonRubricCriteria} from "@/lib/osmium/hooks/training";

export default function LessonRubricCriteriaDeleteButton({lessonId, rubricCriteria}: {
    lessonId: string,
    rubricCriteria: { id: string },
}) {
    const [clicked, setClicked] = useState(false);
    const deleteCriteria = useDeleteLessonRubricCriteria(lessonId);

    const handleClick = async () => {
        if (clicked) {
            try {
                await deleteCriteria.mutateAsync(rubricCriteria.id);
            } catch {
                toast(`Failed to delete criteria.`, {type: 'error'});
                return;
            }
            toast(`Criteria deleted successfully!`, {type: 'success'});
        } else {
            toast(`Deleting this criteria will remove it from all training tickets.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <IconButton onClick={handleClick} disabled={deleteCriteria.isPending}>
            {clicked ? <Delete color="warning"/> : <Delete/>}
        </IconButton>
    );
}
