'use client';
import React, {useState} from 'react';
import {TrainingAppointment} from "@prisma/client";
import {toast} from "react-toastify";
import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {deleteTrainingAppointment} from "@/actions/trainingAppointment";

export default function TrainingAppointmentDeleteButton({trainingAppointment, fromAdmin, onDelete}: {
    trainingAppointment: TrainingAppointment,
    fromAdmin?: boolean,
    onDelete?: () => void,
}) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteTrainingAppointment(trainingAppointment.id, fromAdmin);
            toast(`Appointment deleted successfully!`, {type: 'success'});
            onDelete && onDelete();
            setClicked(false);
        } else {
            toast.warn(`Are you sure you want to delete this training appointment?`);
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete Appointment">
            <IconButton size="small" onClick={handleClick}>
                <Delete fontSize="small" color={clicked ? "warning" : "inherit"}/>
            </IconButton>
        </Tooltip>
    );
}