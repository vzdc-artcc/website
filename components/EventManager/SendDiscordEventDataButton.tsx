'use client';
import React from 'react';
import {Event} from "@prisma/client";
import {Button, ButtonGroup, Tooltip} from "@mui/material";
import {EventPositionWithSolo} from "@/app/events/admin/events/[id]/manager/page";
import {toast} from "react-toastify";
import {sendDiscordEventPositionData} from "@/actions/discord";

export default function SendDiscordEventDataButton({positions, event}: {
    positions: EventPositionWithSolo[],
    event: Event
}) {

    const clickHandler = async () => {
        const ping = false;
        const error = await sendDiscordEventPositionData(event, positions, ping);

        if (error) {
            toast.error(`Failed to send event data to Discord: ${error}`);
            return;
        }

        toast.success('Event data sent to Discord successfully!');
    }

    const clickHandlerPing  = async () => {
        const ping = true
        const error = await sendDiscordEventPositionData(event, positions, ping);

        if (error) {
            toast.error(`Failed to send event data to Discord: ${error}`);
            return;
        }

        toast.success('Event data sent to Discord successfully!');
    }

    return (
        <ButtonGroup size="small">
            <Tooltip title="Post to discord with ping">
                <Button variant="outlined" color="inherit" onClick={clickHandlerPing} disabled={!!event.archived || event.hidden}>Post to Discord</Button>
            </Tooltip>
            <Tooltip title="Post to discord with no ping">
                <Button variant="outlined" color="inherit" onClick={clickHandler} disabled={!!event.archived || event.hidden}>No Ping</Button>
            </Tooltip>
        </ButtonGroup>

    );
}