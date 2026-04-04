'use client';
import React, {useState} from 'react';
import {LessonRubricCell} from "@/generated/prisma/browser";
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {deleteLessonCriteriaCell} from "@/actions/lessonCriteriaCell";

export default function LessonCriteriaCellDeleteButton({criteriaCell}: { criteriaCell: LessonRubricCell }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteLessonCriteriaCell(criteriaCell.id);
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