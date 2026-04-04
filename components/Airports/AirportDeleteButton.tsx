'use client';
import React, {useState} from 'react';
import {Airport} from "@/generated/prisma/browser";
import {Delete} from "@mui/icons-material";
import {IconButton, Tooltip} from "@mui/material";
import {toast} from "react-toastify";
import {deleteAirport} from "@/actions/airports";

export default function AirportDeleteButton({airport}: { airport: Airport, }) {

    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteAirport(airport.icao);
            toast(`Airport '${airport.icao}' deleted successfully!`, {type: 'success'});
        } else {
            toast(`Are you sure you want to delete '${airport.icao}'?  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete">
            <IconButton onClick={handleClick}>
                {clicked ? <Delete color="warning"/> : <Delete/>}
            </IconButton>
        </Tooltip>
    );
}