'use client';
import React from 'react';
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography, Box} from '@mui/material';
import {useOpsPlanFiles} from '@/lib/osmium/hooks/events';
import {osmiumBaseUrl} from '@/lib/osmium/client';
import {formatZuluDate} from '@/lib/date';

export default function OpsPlanFiles({eventId}: { eventId: string }) {
    const {data} = useOpsPlanFiles(eventId);
    const files = data?.items ?? [];

    if (files.length === 0) {
        return (
            <Paper sx={{p: 2, mt: 2}}>
                <Typography variant="h6">OPS Plan Files</Typography>
                <Typography color="text.secondary" sx={{mt: 1}}>
                    No files have been uploaded for this event.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{p: 1, mt: 3}}>
            <Typography variant="h6" sx={{px: 2, pt: 1}}>
                OPS Plan Files
            </Typography>

            <TableContainer>
                <Table size="small" sx={{minWidth: 600}}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{width: '50%'}}>Name</TableCell>
                            <TableCell sx={{width: '30%'}}>Updated</TableCell>
                            <TableCell align="right" sx={{width: '20%'}}>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {files.map((f) => {
                            const href = f.asset_id ? `${osmiumBaseUrl}/cdn/${f.asset_id}` : (f.url || '#');

                            return (
                                <TableRow key={f.id} hover>
                                    <TableCell>
                                        <Box>
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{color: 'inherit', textDecoration: 'none'}}
                                            >
                                                <Typography variant="body1" component="span"
                                                            sx={{textDecoration: 'underline'}}>
                                                    {f.filename}
                                                </Typography>
                                            </a>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatZuluDate(new Date(f.updated_at))}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            variant="contained"
                                            component="a"
                                            href={href}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
