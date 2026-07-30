'use client'
import React from 'react';
import {Button} from "@mui/material";
import {toast} from "react-toastify";
import {Check} from "@mui/icons-material";
import {useCloseIncident} from "@/lib/osmium/hooks/incidents";

export default function IncidentCloseButton({incidentId}: { incidentId: string, }) {

    const closeIncident = useCloseIncident();

    const handleClick = async () => {
        try {
            await closeIncident.mutateAsync(incidentId);
            toast('Incident closed successfully.', {type: 'success'});
        } catch {
            toast('Failed to close incident.', {type: 'error'});
        }
    }

    return (
        <Button variant="contained" size="large" color="warning" startIcon={<Check/>} onClick={handleClick}>
            Close Report
        </Button>
    );
}
