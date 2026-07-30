'use client';
import React from 'react';
import {Chip, CircularProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {useDossier} from "@/lib/osmium/hooks/training";

function DossierTable({cid}: { cid: number }) {

    const {data, isLoading} = useDossier(cid);
    const entries = data?.items ?? [];

    if (isLoading) {
        return <CircularProgress/>;
    }

    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Writer</TableCell>
                        <TableCell>Message</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {entries.length === 0 &&
                        <TableRow>
                            <TableCell colSpan={3}>
                                <Typography>No dossier entries.</Typography>
                            </TableCell>
                        </TableRow>}
                    {entries.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell>{new Date(entry.timestamp).toDateString()}</TableCell>
                            <TableCell>{entry.writer_name ?? 'Unknown'}{entry.writer_cid ? ` (${entry.writer_cid})` : ''}</TableCell>
                            <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    {entry.is_confidential &&
                                        <Chip size="small" color="error" label="Confidential"/>}
                                    <span>{entry.message}</span>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default DossierTable;
