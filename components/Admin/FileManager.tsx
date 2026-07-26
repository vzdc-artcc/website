'use client';
import React, {useRef, useState} from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {ContentCopy, Delete, InsertDriveFile, OpenInNew, UploadFile} from "@mui/icons-material";
import {toast} from "react-toastify";
import {osmiumBaseUrl} from "@/lib/osmium/client";
import {useDeleteFile, useFiles, useImportFileFromUrl, useUploadFile} from "@/lib/osmium/hooks/files";

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const units = ['KB', 'MB', 'GB'];
    let value = bytes / 1024;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }
    return `${value.toFixed(1)} ${units[unit]}`;
}

const cdnUrl = (id: string) => `${osmiumBaseUrl}/cdn/${id}`;

export default function FileManager() {
    const [page, setPage] = useState(0); // 0-based for TablePagination
    const [pageSize, setPageSize] = useState(25);
    const {data, isLoading, isError} = useFiles(page + 1, pageSize);

    const upload = useUploadFile();
    const importUrl = useImportFileFromUrl();
    const deleteFile = useDeleteFile();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [makePublic, setMakePublic] = useState(true);
    const [importUrlValue, setImportUrlValue] = useState('');
    const [pendingDelete, setPendingDelete] = useState<{ id: string, filename: string } | null>(null);

    const items = data?.items ?? [];
    const total = data?.total ?? 0;

    const handleUpload = async (file: File) => {
        try {
            await upload.mutateAsync({file, public: makePublic});
            toast.success(`Uploaded ${file.name}.`);
        } catch {
            toast.error(`Failed to upload ${file.name}.`);
        }
    };

    const handleImport = async () => {
        const url = importUrlValue.trim();
        if (!url) return;
        try {
            await importUrl.mutateAsync({url, public: makePublic});
            toast.success('Imported file from URL.');
            setImportUrlValue('');
        } catch {
            toast.error('Failed to import from that URL.');
        }
    };

    const handleCopy = async (id: string) => {
        try {
            await navigator.clipboard.writeText(cdnUrl(id));
            toast.success('CDN URL copied.');
        } catch {
            toast.error('Could not copy to clipboard.');
        }
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        try {
            await deleteFile.mutateAsync(pendingDelete.id);
            toast.success(`Deleted ${pendingDelete.filename}.`);
        } catch {
            toast.error('Failed to delete file.');
        } finally {
            setPendingDelete(null);
        }
    };

    return (
        <Stack direction="column" spacing={2}>
            {/* Upload controls */}
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems={{sm: 'center'}}>
                <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                        e.target.value = '';
                    }}
                />
                <Button
                    variant="contained"
                    startIcon={upload.isPending ? <CircularProgress size={16} color="inherit"/> : <UploadFile/>}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={upload.isPending}
                >
                    Upload file
                </Button>
                <FormControlLabel
                    control={<Switch checked={makePublic} onChange={(e) => setMakePublic(e.target.checked)}/>}
                    label="Public (servable via CDN without auth)"
                />
            </Stack>

            <Stack direction={{xs: 'column', sm: 'row'}} spacing={1} alignItems={{sm: 'center'}}>
                <TextField
                    size="small"
                    fullWidth
                    label="Import from URL"
                    placeholder="https://example.com/image.png"
                    value={importUrlValue}
                    onChange={(e) => setImportUrlValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleImport(); }}
                />
                <Button
                    variant="outlined"
                    onClick={handleImport}
                    disabled={importUrl.isPending || !importUrlValue.trim()}
                    startIcon={importUrl.isPending ? <CircularProgress size={16}/> : null}
                >
                    Import
                </Button>
            </Stack>

            {/* File table */}
            {isLoading ? (
                <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}><CircularProgress/></Box>
            ) : isError ? (
                <Alert severity="error">Failed to load files.</Alert>
            ) : items.length === 0 ? (
                <Alert severity="info">No files yet. Upload one to get started.</Alert>
            ) : (
                <TableContainer sx={{overflowX: 'auto'}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell/>
                                <TableCell>Filename</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell align="right">Size</TableCell>
                                <TableCell>Visibility</TableCell>
                                <TableCell>Uploaded</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((file) => {
                                const isImage = file.content_type.startsWith('image/');
                                return (
                                    <TableRow key={file.id} hover>
                                        <TableCell>
                                            <Avatar
                                                variant="rounded"
                                                src={isImage && file.is_public ? cdnUrl(file.id) : undefined}
                                                sx={{width: 40, height: 40}}
                                            >
                                                <InsertDriveFile fontSize="small"/>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell sx={{maxWidth: 280, wordBreak: 'break-all'}}>{file.filename}</TableCell>
                                        <TableCell>{file.content_type}</TableCell>
                                        <TableCell align="right">{formatBytes(file.size_bytes)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={file.is_public ? 'Public' : 'Private'}
                                                color={file.is_public ? 'success' : 'default'}
                                                variant={file.is_public ? 'filled' : 'outlined'}
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Copy CDN URL">
                                                <IconButton size="small" onClick={() => handleCopy(file.id)}>
                                                    <ContentCopy fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Open">
                                                <IconButton size="small" component="a" href={cdnUrl(file.id)} target="_blank" rel="noopener noreferrer">
                                                    <OpenInNew fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => setPendingDelete({id: file.id, filename: file.filename})}
                                                >
                                                    <Delete fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={total}
                        page={page}
                        onPageChange={(_e, newPage) => setPage(newPage)}
                        rowsPerPage={pageSize}
                        onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                    />
                </TableContainer>
            )}

            <Dialog open={!!pendingDelete} onClose={() => setPendingDelete(null)}>
                <DialogTitle>Delete file</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Delete <strong>{pendingDelete?.filename}</strong>? Anything still referencing its CDN
                        URL (event banners, publications, avatars) will break. This cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPendingDelete(null)} disabled={deleteFile.isPending}>Cancel</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={confirmDelete}
                        disabled={deleteFile.isPending}
                        startIcon={deleteFile.isPending ? <CircularProgress size={16} color="inherit"/> : null}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
