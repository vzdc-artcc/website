import React from 'react';
import { format } from 'date-fns';
import {
    Box,
    Button,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FormSaveButton from '@/components/Form/FormSaveButton';
import { createOrUpdateOpsPlanFile, deleteOpsPlanFile, fetchOpsPlanFiles } from '@/actions/opsPlanFiles';
import DeleteConfirmButton from '@/components/EventManager/DeleteConfirmButton';

export default async function OpsPlanFileForm({ eventId }: { eventId?: string }) {
    const files = await fetchOpsPlanFiles(eventId);

    const fmt = (d: Date | null | undefined) => (d ? format(d, 'MM/dd/yy HH:mm') : 'N/A');

    async function handleDelete(formData: FormData) {
        'use server';
        const id = String(formData.get('id') || '');
        if (!id) return;
        await deleteOpsPlanFile(id);
    }

    return (
        <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Upload OPS Plan File</Typography>

                <Box
                    component="form"
                    action={createOrUpdateOpsPlanFile}
                    sx={{ mt: 1 }}
                >
                    {eventId && <input type="hidden" name="eventId" value={eventId} />}

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                        <TextField name="name" label="File name" required sx={{ minWidth: 240, flex: 1 }} />

                        <Button variant="contained" component="label" startIcon={<UploadFileIcon />}>
                            Choose file
                            <input type="file" name="file" hidden required />
                        </Button>

                        <Box sx={{ ml: 'auto' }}>
                            <FormSaveButton text="Upload" />
                        </Box>
                    </Stack>

                    <TextField name="description" label="Description (optional)" fullWidth multiline rows={2} sx={{ mt: 1 }} />
                </Box>
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="h6">Existing Files</Typography>

                {files.length === 0 ? (
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                        No files uploaded.
                    </Typography>
                ) : (
                    <TableContainer sx={{ mt: 1 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Uploaded</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {files.map((f) => (
                                    <TableRow key={f.id}>
                                        <TableCell>
                                            <Typography>{f.name}</Typography>
                                        </TableCell>

                                        <TableCell>{f.description || '—'}</TableCell>

                                        <TableCell>{fmt(f.updatedAt as Date)}</TableCell>

                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    component="a"
                                                    href={f.key ? `https://utfs.io/f/${f.key}` : '#'}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    View
                                                </Button>

                                                <DeleteConfirmButton
                                                    id={f.id}
                                                    deleteFunction={deleteOpsPlanFile}
                                                    warningMessage="Are you sure you want to delete this file? Click again to confirm."
                                                />

                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Stack>
    );
}
