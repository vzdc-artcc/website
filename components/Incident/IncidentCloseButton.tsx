'use client'
import React from 'react';
import {IncidentReport} from "@/generated/prisma/browser";
import {Button} from "@mui/material";
import {closeIncident} from "@/actions/incident";
import {toast} from "react-toastify";
import {Check} from "@mui/icons-material";

export default function IncidentCloseButton({incident}: { incident: IncidentReport, }) {

    const handleClick = async () => {
        await closeIncident(incident);

        toast('Incident closed successfully.', {type: 'success'});
    }

    return (
        <Button variant="contained" size="large" color="warning" startIcon={<Check/>} onClick={handleClick}>
            Close Report
        </Button>
    );
}