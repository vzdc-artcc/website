import React from 'react';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {formatHours} from "@/lib/number";

export default function StatisticsTable({heading, logs,}: {
    heading: string, logs: {
        title: string,
        delivery_hours: number,
        ground_hours: number,
        tower_hours: number,
        tracon_hours: number,
        center_hours: number,
        total_hours: number,
    }[]
}) {

    if (logs.length === 0) {
        return <Typography sx={{my: 1,}}>No data for this time period</Typography>
    }

    logs.sort((a, b) => b.total_hours - a.total_hours);

    return (
        <TableContainer sx={{maxHeight: 600,}}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>{heading}</TableCell>
                        <TableCell>Delivery</TableCell>
                        <TableCell>Ground</TableCell>
                        <TableCell>Tower</TableCell>
                        <TableCell>TRACON</TableCell>
                        <TableCell>Center</TableCell>
                        <TableCell>Total</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {logs.map(log => (
                        <TableRow key={log.title}>
                            <TableCell>{log.title}</TableCell>
                            <TableCell>{formatHours(log.delivery_hours)}</TableCell>
                            <TableCell>{formatHours(log.ground_hours)}</TableCell>
                            <TableCell>{formatHours(log.tower_hours)}</TableCell>
                            <TableCell>{formatHours(log.tracon_hours)}</TableCell>
                            <TableCell>{formatHours(log.center_hours)}</TableCell>
                            <TableCell sx={{border: 1,}}>{formatHours(log.total_hours)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}