import React from 'react';
import {ControllerPosition} from "@/generated/prisma/browser";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {formatZuluDate, getDuration} from "@/lib/date";

export default function ControllingSessionsTable({positions}: { positions: ControllerPosition[], }) {

    if (positions.length === 0) {
        return <Typography>No controlling sessions during this time frame.</Typography>
    }

    return (
        <TableContainer sx={{maxHeight: 600}}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Position</TableCell>
                        <TableCell>Start</TableCell>
                        <TableCell>End</TableCell>
                        <TableCell>Duration</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {positions.map((position, index) => (
                        <TableRow key={index}>
                            <TableCell>{position.position}</TableCell>
                            <TableCell>{formatZuluDate(position.start)}</TableCell>
                            <TableCell>{position.end ? formatZuluDate(position.end) : 'ACTIVE'}</TableCell>
                            <TableCell>{getDuration(position.start, position.end || new Date())}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

}