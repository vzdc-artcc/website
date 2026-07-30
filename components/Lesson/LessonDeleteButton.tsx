'use client';
import React, {useState} from 'react';
import {GridActionsCellItem} from "@mui/x-data-grid";
import {Delete} from "@mui/icons-material";
import {toast} from "react-toastify";
import {Tooltip} from "@mui/material";
import {useDeleteTrainingLesson} from "@/lib/osmium/hooks/training";

export default function LessonDeleteButton({lesson}: { lesson: { id: string, name: string } }) {
    const [clicked, setClicked] = useState(false);
    const deleteLesson = useDeleteTrainingLesson();

    const handleDelete = async () => {
        if (clicked) {
            await deleteLesson.mutateAsync(lesson.id);
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
