'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useDeleteAtcBooking} from "@/lib/osmium/hooks/bookings";

export default function AtcBookingDeleteButton({ bookingId }: { bookingId: number }) {

    const [clicked, setClicked] = useState(false);
    const [loading, setLoading] = useState(false);
    const deleteBooking = useDeleteAtcBooking();

    const handleClick = async () => {
        if (clicked) {
            setLoading(true);
            try {
                await deleteBooking.mutateAsync(bookingId);
                toast(`ATC booking deleted successfully!`, {type: 'success'});
            } catch (e) {
                toast((e as Error).message, {type: 'error'});
            }
            setLoading(false);
        } else {
            toast(`This will permanently delete the ATC booking from VATSIM systems.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <IconButton onClick={handleClick} disabled={loading}>
            {clicked ? <Delete color="warning"/> : <Delete/>}
        </IconButton>
    );

}