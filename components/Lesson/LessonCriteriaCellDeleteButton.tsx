'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useDeleteLessonRubricCell} from "@/lib/osmium/hooks/training";

export default function LessonCriteriaCellDeleteButton({lessonId, criteriaId, criteriaCell}: {
    lessonId: string,
    criteriaId: string,
    criteriaCell: { id: string },
}) {
    const [clicked, setClicked] = useState(false);
    const deleteCell = useDeleteLessonRubricCell(lessonId);

    const handleClick = async () => {
        if (clicked) {
            await deleteCell.mutateAsync({criteriaId, cellId: criteriaCell.id});
            toast(`Cell deleted successfully!`, {type: 'success'});
        } else {
            toast(`Deleting this criteria cell will remove it from all training tickets and scores.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <IconButton onClick={handleClick}>
            {clicked ? <Delete color="warning"/> : <Delete/>}
        </IconButton>
    );
}
