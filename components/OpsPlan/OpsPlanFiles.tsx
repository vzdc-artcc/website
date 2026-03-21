// components/OpsPlan/OpsPlanFiles.tsx
import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography, Box } from '@mui/material';
import { format } from 'date-fns';
import { fetchOpsPlanFiles } from '@/actions/opsPlanFiles';

type Props = {
    eventId: string;
};

export default async function OpsPlanFiles({ eventId }: Props) {
    const files = await fetchOpsPlanFiles(eventId);

    // If nothing, show friendly empty state (paper)
    if (!files || files.length === 0) {
        return (
            <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6">OPS Plan Files</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                    No files have been uploaded for this event.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 1, mt: 3 }}>
            <Typography variant="h6" sx={{ px: 2, pt: 1 }}>
                OPS Plan Files
            </Typography>

            <TableContainer>
                <Table size="small" sx={{ minWidth: 600 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: '40%' }}>Name</TableCell>
                            <TableCell sx={{ width: '40%' }}>Description</TableCell>
                            <TableCell sx={{ width: '15%' }}>Updated</TableCell>
                            <TableCell align="right" sx={{ width: '5%' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {files.map((f: any) => {
                            const updated = f.updatedAt ? format(new Date(f.updatedAt), 'MM/dd/yy HH:mm') : '';
                            const href = f.key ? `https://utfs.io/f/${f.key}` : '#';

                            return (
                                <TableRow key={f.id} hover>
                                    <TableCell>
                                        <Box>
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{ color: 'inherit', textDecoration: 'none' }}
                                            >
                                                <Typography variant="body1" component="span" sx={{ textDecoration: 'underline' }}>
                                                    {f.name}
                                                </Typography>
                                            </a>
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {f.description || '—'}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {updated}
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
