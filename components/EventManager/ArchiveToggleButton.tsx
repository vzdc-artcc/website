'use client';

import {toggleEventArchived} from "@/actions/eventManagement";
import {Button} from "@mui/material";
import {Event} from "@/generated/prisma/browser";
import {toast} from "react-toastify";

export default function ArchiveToggleButton({ event }: { event: Event,}) {
    
    const handleClick = () => {
        if (event.archived && event.end < new Date()) {
            toast.error('Cannot unarchive an event that has ended. If you really want to unarchive this event, please change the start and end times.');
            return;
        }
        toggleEventArchived(event);
    }

    return (
        <Button 
        variant="outlined"
        color={event.archived ? 'info' : 'warning'} 
        onClick={handleClick}>
            {event.archived ? 'Un-Archive' : 'Archive' } 
        </Button>
    );
}