import React from 'react';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";

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
                            <TableCell>{log.delivery_hours.toPrecision(3)}</TableCell>
                            <TableCell>{log.ground_hours.toPrecision(3)}</TableCell>
                            <TableCell>{log.tower_hours.toPrecision(3)}</TableCell>
                            <TableCell>{log.tracon_hours.toPrecision(3)}</TableCell>
                            <TableCell>{log.center_hours.toPrecision(3)}</TableCell>
                            <TableCell sx={{border: 1,}}>{log.total_hours.toPrecision(3)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}