'use client';
import React from 'react';
import {Event} from "@prisma/client";
import {Button} from "@mui/material";
import {sendDiscordEventPositionData} from "@/actions/eventPosition";
import {EventPositionWithSolo} from "@/app/events/admin/events/[id]/manager/page";
import {toast} from "react-toastify";

export default function SendDiscordEventDataButton({positions, event}: {
    positions: EventPositionWithSolo[],
    event: Event
}) {

    const clickHandler = async () => {
        const error = await sendDiscordEventPositionData(event, positions);

        if (error) {
            toast.error(`Failed to send event data to Discord: ${error}`);
            return;
        }

        toast.success('Event data sent to Discord successfully!');
    }
    return (
        <Button variant="outlined" color="inherit" onClick={clickHandler} disabled={!!event.archived || event.hidden}>Post
            to Discord</Button>
    );
}