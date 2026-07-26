'use client';
import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {ContentCopy} from "@mui/icons-material";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {useAccessCatalog, useMyAccess} from "@/lib/osmium/hooks/access";
import {useCreateApiKey} from "@/lib/osmium/hooks/api-keys";
import PermissionsPicker from "@/components/Access/PermissionsPicker";
import FormSaveButton from "@/components/Form/FormSaveButton";

export default function Page() {
    const router = useRouter();
    const {data: catalog, isLoading: catalogLoading, isError: catalogErrored} = useAccessCatalog();
    const {data: myAccess, isLoading: myAccessLoading, isError: myAccessErrored} = useMyAccess();
    const createApiKey = useCreateApiKey();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [createdSecret, setCreatedSecret] = useState<string | null>(null);

    const unrestricted = myAccess?.server_admin === true;
    const myPermissions = new Set(myAccess?.permissions ?? []);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast('Name is required.', {type: 'error'});
            return;
        }
        if (selected.size === 0) {
            toast('Select at least one permission.', {type: 'error'});
            return;
        }

        try {
            const result = await createApiKey.mutateAsync({
                name: name.trim(),
                description: description.trim() || undefined,
                expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
                permissions: Array.from(selected),
            });
            if (result) {
                setCreatedSecret(result.secret);
            }
        } catch {
            toast('Failed to create API key.', {type: 'error'});
        }
    };

    const copySecret = async () => {
        if (!createdSecret) return;
        await navigator.clipboard.writeText(createdSecret);
        toast('Secret copied to clipboard.', {type: 'success'});
    };

    if (createdSecret) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 2,}}>API Key Created</Typography>
                    <Alert severity="warning" sx={{mb: 2,}}>
                        This secret is shown only once. Copy it now — it cannot be retrieved again.
                    </Alert>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField fullWidth variant="filled" value={createdSecret}
                                   slotProps={{input: {readOnly: true, style: {fontFamily: 'monospace'}}}}/>
                        <Button variant="outlined" startIcon={<ContentCopy/>} onClick={copySecret}>Copy</Button>
                    </Stack>
                    <Box sx={{mt: 2,}}>
                        <Button variant="contained" onClick={() => router.push('/website-management/api-keys')}>
                            Done
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (catalogLoading || myAccessLoading) {
        return <CircularProgress/>;
    }

    if (catalogErrored || myAccessErrored) {
        return <Alert severity="error">Failed to load permission catalog.</Alert>;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>New API Key</Typography>
                <form action={handleSubmit}>
                    <Stack direction="column" spacing={2} sx={{mb: 2,}}>
                        <TextField fullWidth required variant="filled" label="Name" value={name}
                                   onChange={(e) => setName(e.target.value)}/>
                        <TextField fullWidth variant="filled" label="Description" value={description}
                                   onChange={(e) => setDescription(e.target.value)}/>
                        <TextField fullWidth variant="filled" label="Expires At" type="datetime-local"
                                   value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                                   slotProps={{inputLabel: {shrink: true}}}/>
                    </Stack>
                    <Typography variant="h6" sx={{mb: 1,}}>Permissions</Typography>
                    <PermissionsPicker
                        catalog={catalog?.permissions ?? []}
                        selected={selected}
                        onChange={setSelected}
                        assignable={unrestricted ? undefined : myPermissions}
                    />
                    <Box sx={{mt: 2,}}>
                        <FormSaveButton text="Create API Key"/>
                    </Box>
                </form>
            </CardContent>
        </Card>
    );
}
