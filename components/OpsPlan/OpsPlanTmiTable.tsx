import React from "react";
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
interface TmiLike {
    id: string;
    tmi_type: string;
    notes?: string | null;
}

export default function OpsPlanTmiTable({tmis}: { tmis: TmiLike[] }) {
    return (
        <Paper sx={{p: 2, bgcolor: 'background.paper', borderRadius: 1}}>
            <Typography variant="h6" sx={{mb: 1}}>Traffic Management Initiatives</Typography>

            {tmis.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                    No TMIs are currently listed for this event.
                </Typography>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{maxHeight: "40vh"}}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell>Traffic Management Initiative</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tmis.map((tmi) => (
                                <TableRow key={tmi.id}>
                                    <TableCell>{tmi.tmi_type}</TableCell>
                                    <TableCell sx={{whiteSpace: 'pre-wrap'}}>{tmi.notes || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
}
