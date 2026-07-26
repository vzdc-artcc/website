'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useDeleteTrainingAppointment} from "@/lib/osmium/hooks/training";
import {deleteAppointmentAtcBooking} from "@/lib/osmium/atcBookingSync";

export default function TrainingAppointmentDeleteButton({trainingAppointment, fromAdmin, onDelete}: {
    trainingAppointment: { id: string, start: string | Date, atc_booking_id?: string | null },
    fromAdmin?: boolean,
    onDelete?: () => void,
}) {
    const [clicked, setClicked] = useState(false);
    const deleteAppointment = useDeleteTrainingAppointment();

    const handleClick = async () => {
        if (clicked) {
            await deleteAppointment.mutateAsync(trainingAppointment.id);
            if (trainingAppointment.atc_booking_id) {
                await deleteAppointmentAtcBooking(trainingAppointment.atc_booking_id);
            }
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
            <IconButton size="small" onClick={handleClick}
                        disabled={!fromAdmin && (new Date()).getTime() > new Date(trainingAppointment.start).getTime()}>
                <Delete fontSize="small" color={clicked ? "warning" : "inherit"}/>
            </IconButton>
        </Tooltip>
    );
}
