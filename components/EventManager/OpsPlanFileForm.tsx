'use client';
import React, {useState} from 'react';
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
import DeleteConfirmButton from '@/components/EventManager/DeleteConfirmButton';
import {toast} from "react-toastify";
import {formatZuluDate} from "@/lib/date";
import {osmiumBaseUrl} from "@/lib/osmium/client";
import {useCreateOpsPlanFile, useDeleteOpsPlanFile, useOpsPlanFiles} from "@/lib/osmium/hooks/events";
import {useUploadFile} from "@/lib/osmium/hooks/files";

export default function OpsPlanFileForm({eventId}: { eventId: string }) {

    const {data} = useOpsPlanFiles(eventId);
    const files = data?.items ?? [];
    const createFile = useCreateOpsPlanFile(eventId);
    const deleteFile = useDeleteOpsPlanFile(eventId);
    const uploadFile = useUploadFile();

    const [name, setName] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async () => {
        if (!name.trim() || !file) {
            toast.error('Please enter a name and choose a file.');
            return;
        }
        try {
            const uploaded = await uploadFile.mutateAsync({file, public: true});
            await createFile.mutateAsync({
                asset_id: uploaded.id,
                filename: name,
                file_type: uploaded.content_type,
            });
            setName('');
            setFile(null);
            toast.success('File uploaded successfully.');
        } catch {
            toast.error('Failed to upload file.');
        }
    };

    return (
        <Stack spacing={2}>
            <Paper sx={{p: 2}}>
                <Typography variant="h6">Upload OPS Plan File</Typography>

                <Box sx={{mt: 1,}}>
                    <form action={handleSubmit}>
                        <Stack direction={{xs: 'column', md: 'row'}} spacing={2} alignItems="center">
                            <TextField label="File name" value={name} onChange={(e) => setName(e.target.value)}
                                       required sx={{minWidth: 240, flex: 1}}/>

                            <Button variant="contained" component="label" startIcon={<UploadFileIcon/>}>
                                {file ? file.name : 'Choose file'}
                                <input type="file" hidden required
                                       onChange={(e) => setFile(e.target.files?.[0] || null)}/>
                            </Button>

                            <Box sx={{ml: 'auto'}}>
                                <FormSaveButton text="Upload"/>
                            </Box>
                        </Stack>
                    </form>
                </Box>
            </Paper>

            <Paper sx={{p: 2}}>
                <Typography variant="h6">Existing Files</Typography>

                {files.length === 0 ? (
                    <Typography color="text.secondary" sx={{mt: 1}}>
                        No files uploaded.
                    </Typography>
                ) : (
                    <TableContainer sx={{mt: 1}}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Uploaded</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {files.map((f) => {
                                    const href = f.asset_id ? `${osmiumBaseUrl}/cdn/${f.asset_id}` : (f.url || '#');
                                    return (
                                        <TableRow key={f.id}>
                                            <TableCell>
                                                <Typography>{f.filename}</Typography>
                                            </TableCell>

                                            <TableCell>{formatZuluDate(new Date(f.updated_at))}</TableCell>

                                            <TableCell align="right">
                                                <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
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

                                                    <DeleteConfirmButton
                                                        id={f.id}
                                                        deleteFunction={(id) => deleteFile.mutateAsync(id)}
                                                        warningMessage="Are you sure you want to delete this file? Click again to confirm."
                                                    />
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Stack>
    );
}
