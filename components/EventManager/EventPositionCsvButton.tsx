'use client';
import React from 'react';
import {EventPositionWithSolo} from "@/app/events/admin/events/[id]/manager/page";
import {Event} from "@prisma/client";
import {IconButton, Tooltip} from "@mui/material";
import {Download} from "@mui/icons-material";
import {formatZuluDate} from "@/lib/date";
import {toast} from "react-toastify";
import {stringify} from "csv-stringify";

export default function EventPositionCsvButton({event, positions}: {
    event: Event,
    positions: EventPositionWithSolo[]
}) {

    const onClick = async () => {
        const csvRows = [
            ['First Name', 'Last Name', 'Rating', 'CID', 'Solo Position', 'Requested Position', 'Requested Start Time', 'Requested End Time', 'Notes', 'Final Position', 'Final Start Time', 'Final End Time', 'Final Notes'],
            ...positions.map(position => [
                position.user?.firstName,
                position.user?.lastName,
                position.user?.rating,
                position.user?.cid,
                position.soloCert ? position.soloCert.position : '',
                position.requestedPosition,
                formatZuluDate(position.requestedStartTime),
                formatZuluDate(position.requestedEndTime),
                position.notes,
                position.finalPosition || '',
                formatZuluDate(position.finalStartTime || position.requestedStartTime),
                formatZuluDate(position.finalEndTime || position.requestedEndTime),
                position.finalNotes || ''
            ])
        ];

        const csvContent = await new Promise<string>((resolve, reject) => {
            stringify(csvRows, {
                columns: [
                    'First Name', 'Last Name', 'Rating', 'CID', 'Solo Position', 'Requested Position',
                    'Requested Start Time', 'Requested End Time', 'Notes', 'Final Position',
                    'Final Start Time', 'Final End Time', 'Final Notes',
                ],
            }, (err, output) => {
                if (err) reject(err);
                else resolve(output);
            });
        });
        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `event_positions_${event.name.toLowerCase().replaceAll(' ', '_')}_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('CSV downloaded successfully!');
    }

    return (
        <Tooltip title="Download CSV of Positions">
            <IconButton onClick={onClick}><Download/></IconButton>
        </Tooltip>
    );

}