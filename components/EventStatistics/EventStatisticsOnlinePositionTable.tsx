'use client';
import React, {useMemo, useState} from 'react';
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

export interface OnlinePositionRow {
    position: string;
    started_at: string;
    ended_at?: string | null;
}

// osmium's controller-position list exposes the ARTCC facility_name and the
// position callsign, but not the numeric DEL/GND/TWR/APP/CTR facility type the
// old Prisma column carried. Derive a display label from the callsign suffix.
const facilityFromPosition = (position: string): string => {
    const suffix = position.toUpperCase().split('_').pop() ?? '';
    switch (suffix) {
        case 'DEL':
            return 'DEL';
        case 'GND':
            return 'GND';
        case 'TWR':
            return 'TWR';
        case 'APP':
        case 'DEP':
            return 'APP';
        case 'CTR':
            return 'CTR';
        case 'FSS':
            return 'FSS';
        default:
            return suffix || 'UNKNOWN';
    }
};

const durationHours = (position: OnlinePositionRow): number => {
    const start = new Date(position.started_at);
    const end = position.ended_at ? new Date(position.ended_at) : new Date();
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

export default function EventStatisticsOnlinePositionTable({allPositions,}: { allPositions: OnlinePositionRow[], }) {

    const [filterInput, setFilterInput] = useState<string>('');

    const filteredPositions = useMemo(() => {
        const filters = filterInput.toUpperCase().split(',').map(v => v.trim()).filter(v => v.length > 0);
        if (filters.length === 0) return allPositions;
        return allPositions.filter(position => filters.some(filter => position.position.toUpperCase().includes(filter)));
    }, [allPositions, filterInput]);

    return (
        <Box>
            <TextField fullWidth size="small" variant="outlined" label="Filter values by position" value={filterInput}
                       placeholder="Ex. _TWR, DCA_, etc." helperText="Seperate with commas. NOT case sensitive."
                       onChange={(e) => setFilterInput(e.target.value)}/>
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
                                    <TableCell>{facilityFromPosition(position.position)}</TableCell>
                                    <TableCell>{position.position}</TableCell>
                                    <TableCell>{formatZuluDate(new Date(position.started_at))}</TableCell>
                                    <TableCell>{durationHours(position).toFixed(3)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>}
            {filteredPositions.length > 0 && <Typography>Total
                Hours: {filteredPositions.reduce((sum, position) => sum + durationHours(position), 0).toFixed(3)}</Typography>}
        </Box>
    );
}
