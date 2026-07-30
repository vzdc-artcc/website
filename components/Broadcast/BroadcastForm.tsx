'use client';
import React, {useState} from 'react';
import {
    Autocomplete,
    FormControlLabel,
    Grid,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import MarkdownEditor from "@uiw/react-markdown-editor";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {useCreateBroadcast, useUpdateBroadcast} from "@/lib/osmium/hooks/broadcasts";
import BroadcastRecipientPicker from "@/components/Broadcast/BroadcastRecipientPicker";
import {formatZuluDate} from "@/lib/date";

interface PublicationOption {
    id: string;
    title: string;
}

interface BroadcastRecipient {
    cid: number;
    name: string;
    seen_at?: string | null;
    agreed_at?: string | null;
}

interface ExistingBroadcast {
    id: string;
    title: string;
    description: string;
    file_id?: string | null;
    exempt_staff: boolean;
    recipients?: BroadcastRecipient[];
}

export default function BroadcastForm({broadcast, allFiles}: {
    broadcast?: ExistingBroadcast,
    allFiles: PublicationOption[],
}) {

    const router = useRouter();
    const createBroadcast = useCreateBroadcast();
    const updateBroadcast = useUpdateBroadcast();
    const [selectedFile, setSelectedFile] = useState<PublicationOption | null>(
        allFiles.find((f) => f.id === broadcast?.file_id) || null
    );
    const [description, setDescription] = useState<string>(broadcast?.description || '');
    const [title, setTitle] = useState<string>(broadcast?.title || '');
    const [exemptStaff, setExemptStaff] = useState<boolean>(broadcast?.exempt_staff || false);
    const [recipientGroups, setRecipientGroups] = useState<string[]>([]);

    const handleSubmit = async (_formData: FormData) => {
        if (!title.trim() || !description.trim()) {
            toast('Please fill out all required fields.', {type: 'error'});
            return;
        }

        if (!broadcast && recipientGroups.length === 0) {
            toast('Please select at least one recipient group.', {type: 'error'});
            return;
        }

        try {
            if (broadcast) {
                await updateBroadcast.mutateAsync({
                    broadcastId: broadcast.id,
                    body: {
                        title,
                        description,
                        file_id: selectedFile?.id || null,
                        exempt_staff: exemptStaff,
                    },
                });
            } else {
                await createBroadcast.mutateAsync({
                    title,
                    description,
                    file_id: selectedFile?.id || null,
                    exempt_staff: exemptStaff,
                    recipient_groups: recipientGroups,
                });
            }
        } catch {
            toast('Failed to save broadcast.', {type: 'error'});
            return;
        }

        toast.success('Broadcast saved.');
        if (!broadcast) {
            router.push('/admin/broadcasts');
        }
    }

    return (
        <form action={handleSubmit}>
        <Grid container columns={2} spacing={2}>
            {!broadcast && <Grid size={2}>
                <BroadcastRecipientPicker selectedGroups={recipientGroups} onChange={setRecipientGroups}/>
            </Grid>}
            <Grid size={2}>
                <TextField fullWidth variant="filled" label="Title" value={title}
                           onChange={(e) => setTitle(e.target.value)}/>
            </Grid>
            <Grid size={2}>
                <Typography gutterBottom>Description:</Typography>
                <MarkdownEditor
                    enableScroll={false}
                    minHeight="200px"
                    value={description}
                    onChange={(d) => setDescription(d)}
                />
            </Grid>
            {!broadcast && <Grid size={2}>
                <FormControlLabel
                    control={<Switch checked={exemptStaff} onChange={(e) => setExemptStaff(e.target.checked)}/>}
                    label="Exempt 'STAFF'? (Cannot be changed later)"/>
            </Grid>}
            <Grid size={2}>
                <Autocomplete
                    id="file-autocomplete"
                    options={allFiles}
                    getOptionLabel={(option) => option.title}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(event, newValue) => setSelectedFile(newValue)}
                    value={selectedFile}
                    renderInput={(params) => <TextField {...params} label="File (optional)" variant="filled"/>}
                />
            </Grid>
            <Grid size={2}>
                <FormSaveButton/>
            </Grid>
            {broadcast?.recipients && (
                <Grid size={2}>
                    <Typography variant="h6" gutterBottom>Recipients</Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Controller</TableCell>
                                    <TableCell>Seen</TableCell>
                                    <TableCell>Reviewed</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {broadcast.recipients
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map((r) => (
                                        <TableRow key={r.cid}>
                                            <TableCell>{r.name} ({r.cid})</TableCell>
                                            <TableCell>{r.seen_at ? formatZuluDate(new Date(r.seen_at)) : '-'}</TableCell>
                                            <TableCell>{r.agreed_at ? formatZuluDate(new Date(r.agreed_at)) : '-'}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            )}
        </Grid>
        </form>
    );
}
