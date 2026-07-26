'use client';
import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from "next/navigation";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {toast} from "react-toastify";
import {useAccessCatalog, useMyAccess} from "@/lib/osmium/hooks/access";
import {useApiKey, useRevokeApiKey, useUpdateApiKey} from "@/lib/osmium/hooks/api-keys";
import PermissionsPicker from "@/components/Access/PermissionsPicker";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {getTimeAgo} from "@/lib/date";

export default function Page() {
    const params = useParams<{ keyId: string }>();
    const router = useRouter();
    const {data: key, isLoading: keyLoading, isError: keyErrored} = useApiKey(params.keyId);
    const {data: catalog, isLoading: catalogLoading} = useAccessCatalog();
    const {data: myAccess, isLoading: myAccessLoading} = useMyAccess();
    const updateApiKey = useUpdateApiKey();
    const revokeApiKey = useRevokeApiKey();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [revokeClicked, setRevokeClicked] = useState(false);

    useEffect(() => {
        if (key) {
            setName(key.name);
            setDescription(key.description ?? '');
            setSelected(new Set(key.permissions));
        }
    }, [key]);

    const unrestricted = myAccess?.server_admin === true;
    const myPermissions = new Set(myAccess?.permissions ?? []);
    const revoked = key?.status === 'disabled';

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast('Name is required.', {type: 'error'});
            return;
        }
        try {
            await updateApiKey.mutateAsync({
                keyId: params.keyId,
                name: name.trim(),
                description: description.trim() || undefined,
                permissions: Array.from(selected),
            });
            toast('API key updated.', {type: 'success'});
        } catch {
            toast('Failed to update API key.', {type: 'error'});
        }
    };

    const handleRevoke = async () => {
        if (revokeClicked) {
            try {
                await revokeApiKey.mutateAsync(params.keyId);
                toast('API key revoked.', {type: 'success'});
                router.push('/website-management/api-keys');
            } catch {
                toast('Failed to revoke API key.', {type: 'error'});
            }
        } else {
            toast('Are you sure you want to revoke this API key? Click again to confirm.', {type: 'warning'});
            setRevokeClicked(true);
        }
    };

    if (keyLoading || catalogLoading || myAccessLoading) {
        return <CircularProgress/>;
    }

    if (keyErrored || !key) {
        return <Alert severity="error">API key not found.</Alert>;
    }

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                            <Typography variant="h5">{key.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{fontFamily: 'monospace',}}>
                                {key.key}{key.prefix ? ` (${key.prefix}…${key.last_four})` : ''}
                            </Typography>
                        </Box>
                        <Chip label={key.status} color={key.status === 'active' ? 'success' : 'default'}/>
                    </Stack>
                    <Grid container spacing={2} sx={{mt: 1,}}>
                        <Grid size={{xs: 12, sm: 6}}>
                            <Typography variant="body2" color="text.secondary">Created By</Typography>
                            <Typography>{key.created_by_display_name || '—'}</Typography>
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <Typography variant="body2" color="text.secondary">Created</Typography>
                            <Typography>{getTimeAgo(new Date(key.created_at))}</Typography>
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <Typography variant="body2" color="text.secondary">Last Used</Typography>
                            <Typography>{key.last_used_at ? getTimeAgo(new Date(key.last_used_at)) : 'Never'}</Typography>
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <Typography variant="body2" color="text.secondary">Expires</Typography>
                            <Typography>{key.expires_at ? new Date(key.expires_at).toLocaleString() : 'Never'}</Typography>
                        </Grid>
                        {key.revoked_at && (
                            <Grid size={{xs: 12, sm: 6}}>
                                <Typography variant="body2" color="text.secondary">Revoked</Typography>
                                <Typography>{getTimeAgo(new Date(key.revoked_at))}</Typography>
                            </Grid>
                        )}
                    </Grid>
                    {!revoked && (
                        <Box sx={{mt: 2,}}>
                            <Tooltip title="Revoke">
                                <IconButton onClick={handleRevoke} color={revokeClicked ? 'warning' : 'default'}>
                                    <Delete/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 2,}}>Edit</Typography>
                    <form action={handleSubmit}>
                        <Stack direction="column" spacing={2} sx={{mb: 2,}}>
                            <TextField fullWidth required variant="filled" label="Name" value={name}
                                       disabled={revoked} onChange={(e) => setName(e.target.value)}/>
                            <TextField fullWidth variant="filled" label="Description" value={description}
                                       disabled={revoked} onChange={(e) => setDescription(e.target.value)}/>
                        </Stack>
                        <Typography variant="h6" sx={{mb: 1,}}>Permissions</Typography>
                        <PermissionsPicker
                            catalog={catalog?.permissions ?? []}
                            selected={selected}
                            onChange={setSelected}
                            assignable={unrestricted ? undefined : myPermissions}
                            readOnly={revoked}
                        />
                        {!revoked && (
                            <Box sx={{mt: 2,}}>
                                <FormSaveButton/>
                            </Box>
                        )}
                    </form>
                </CardContent>
            </Card>
        </Stack>
    );
}
