'use client';
import React from 'react';
import {IconButton, Tooltip} from "@mui/material";
import {Download} from "@mui/icons-material";
import {formatZuluDate} from "@/lib/date";
import {toast} from "react-toastify";
import {stringify} from "csv-stringify";

interface PositionLike {
    user_name?: string | null;
    user_cid?: number | null;
    requested_position?: string | null;
    requested_start_time?: string | null;
    requested_end_time?: string | null;
    notes?: string | null;
    final_position?: string | null;
    final_start_time?: string | null;
    final_end_time?: string | null;
    final_notes?: string | null;
}

export default function EventPositionCsvButton({eventTitle, positions}: {
    eventTitle: string,
    positions: PositionLike[]
}) {

    const onClick = async () => {
        const columns = ['Controller', 'CID', 'Requested Position', 'Requested Start Time', 'Requested End Time', 'Notes', 'Final Position', 'Final Start Time', 'Final End Time', 'Final Notes'];
        const csvRows = [
            columns,
            ...positions.map(position => [
                position.user_name || '',
                position.user_cid ? String(position.user_cid) : '',
                position.requested_position || '',
                position.requested_start_time ? formatZuluDate(new Date(position.requested_start_time)) : '',
                position.requested_end_time ? formatZuluDate(new Date(position.requested_end_time)) : '',
                position.notes || '',
                position.final_position || '',
                formatZuluDate(new Date(position.final_start_time || position.requested_start_time || new Date())),
                formatZuluDate(new Date(position.final_end_time || position.requested_end_time || new Date())),
                position.final_notes || ''
            ])
        ];

        const csvContent = await new Promise<string>((resolve, reject) => {
            stringify(csvRows, {columns}, (err, output) => {
                if (err) reject(err);
                else resolve(output);
            });
        });
        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `event_positions_${eventTitle.toLowerCase().replaceAll(' ', '_')}_${new Date().toISOString()}.csv`);
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
