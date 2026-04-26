'use client';
import React, {useState} from 'react';
import {ControllerPosition} from "@/generated/prisma/browser";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import {formatZuluDate} from "@/lib/date";

export default function EventStatisticsOnlinePositionTable({allPositions,}: { allPositions: ControllerPosition[], }) {

    const [filteredPositions, setFilteredPositions] = useState<ControllerPosition[]>(allPositions);
    const [filterInput, setFilterInput] = useState<string>('');

    const getFacility = (facility: number) => {
        switch (facility) {
            case 0:
                return 'OBS';
            case 1:
                return 'FSS';
            case 2:
                return 'DEL';
            case 3:
                return 'GND';
            case 4:
                return 'TWR';
            case 5:
                return 'APP';
            case 6:
                return 'CTR';
            default:
                return 'UNKNOWN';
        }
    }

    const getDurationHours = (position: ControllerPosition) => {
        const start = new Date(position.start);
        const end = position.end ? new Date(position.end) : new Date();
        const durationMs = end.getTime() - start.getTime();
        return (durationMs / (1000 * 60 * 60));
    }

    const setFilterValues = (value: string) => {
        setFilterInput(value.toUpperCase());
        const newFilters = value.toUpperCase().split(',').map(v => v.trim().toUpperCase()).filter(v => v.length > 0);
        if (newFilters.length === 0) {
            setFilteredPositions(allPositions);
        } else {
            setFilteredPositions(allPositions.filter(position => newFilters.some(filter => position.position.toUpperCase().includes(filter))));
        }
    }

    return (
        <Box>
            <TextField fullWidth size="small" variant="outlined" label="Filter values by position" value={filterInput}
                       placeholder="Ex. _TWR, DCA_, etc." helperText="Seperate with commas. NOT case sensitive."
                       onChange={(e) => setFilterValues(e.target.value)}/>
            {filteredPositions.length === 0 && <Typography sx={{mt: 2, mb: 1,}}>No positions found.</Typography>}
            {filteredPositions.length > 0 &&
                <TableContainer sx={{maxHeight: 250, mb: 2, mt: 1,}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Facility</TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Start</TableCell>
                                <TableCell>Hours</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPositions.map((position, index) => (
                                <TableRow key={index}>
                                    <TableCell>{getFacility(position.facility || -1)}</TableCell>
                                    <TableCell>{position.position}</TableCell>
                                    <TableCell>{formatZuluDate(position.start)}</TableCell>
                                    <TableCell>{getDurationHours(position).toFixed(3)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>}
            {filteredPositions.length > 0 && <Typography>Total
                Hours: {filteredPositions.reduce((sum, position) => sum + getDurationHours(position), 0).toFixed(3)}</Typography>}
        </Box>
    );
}