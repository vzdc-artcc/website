'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {LessonRubricCriteria} from "@/generated/prisma/browser";
import {deleteLessonRubricCriteria} from "@/actions/lessonRubricCriteria";

export default function LessonRubricCriteriaDeleteButton({rubricCriteria}: { rubricCriteria: LessonRubricCriteria, }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteLessonRubricCriteria(rubricCriteria.id);
            toast(`Criteria deleted successfully!`, {type: 'success'});
        } else {
            toast(`Deleting this criteria will remove it from all training tickets.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <IconButton onClick={handleClick}>
            {clicked ? <Delete color="warning"/> : <Delete/>}
        </IconButton>
    );
}