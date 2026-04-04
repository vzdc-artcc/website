'use client';
import React, {useState} from 'react';
import {GridActionsCellItem} from "@mui/x-data-grid";
import {Delete} from "@mui/icons-material";
import {toast} from "react-toastify";
import {deleteLesson} from "@/actions/lesson";
import {Tooltip} from "@mui/material";
import {Lesson} from "@/generated/prisma/browser";

export default function LessonDeleteButton({lesson}: { lesson: Lesson }) {
    const [clicked, setClicked] = useState(false);

    const handleDelete = async () => {
        if (clicked) {
            await deleteLesson(lesson.id);
            toast(`'${lesson.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast(`Deleting '${lesson.name}' will remove this lesson. Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }
    }

    return (
        <Tooltip title="Delete Lesson">
            <GridActionsCellItem
                icon={<Delete color={clicked ? "warning" : "inherit"}/>}
                label="Delete Lesson"
                onClick={handleDelete}
            />
        </Tooltip>
    );
}