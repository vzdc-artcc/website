'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {deleteAtcBooking} from "@/actions/atcBooking";

export default function AtcBookingDeleteButton({ bookingId }: { bookingId: string }) {

    const [clicked, setClicked] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            setLoading(true);
            await deleteAtcBooking(bookingId);
            toast(`ATC booking deleted successfully!`, {type: 'success'});
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