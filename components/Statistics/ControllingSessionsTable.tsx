import React from 'react';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {formatZuluDate, getDuration} from "@/lib/date";
import {components} from "@/lib/osmium/generated/schema";

type ControllerPositionItem = components["schemas"]["ControllerPositionItem"];

export default function ControllingSessionsTable({positions}: { positions: ControllerPositionItem[], }) {

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
                            <TableCell>{position.position_name}</TableCell>
                            <TableCell>{formatZuluDate(new Date(position.started_at))}</TableCell>
                            <TableCell>{position.ended_at ? formatZuluDate(new Date(position.ended_at)) : 'ACTIVE'}</TableCell>
                            <TableCell>{getDuration(new Date(position.started_at), position.ended_at ? new Date(position.ended_at) : new Date())}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

}