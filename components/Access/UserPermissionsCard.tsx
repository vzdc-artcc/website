'use client';
import React, {useEffect, useState} from 'react';
import {Alert, Box, Card, CardContent, TextField, Typography} from "@mui/material";
import {toast} from "react-toastify";
import {
    BASELINE_PERMISSIONS,
    useAccessCatalog,
    useMyAccess,
    useUpdateUserAccess,
    useUserAccess,
} from "@/lib/osmium/hooks/access";
import PermissionsPicker from "@/components/Access/PermissionsPicker";
import FormSaveButton from "@/components/Form/FormSaveButton";

export default function UserPermissionsCard({cid}: { cid: number }) {
    const {data: catalog, isLoading: catalogLoading, isError: catalogErrored} = useAccessCatalog();
    const {data: access, isLoading: accessLoading, isError: accessErrored} = useUserAccess(cid);
    const {data: myAccess, isLoading: myAccessLoading, isError: myAccessErrored} = useMyAccess();
    const updateAccess = useUpdateUserAccess();

    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (access) setSelected(new Set(access.permissions));
    }, [access]);

    const unrestricted = myAccess?.server_admin === true;
    const myPermissions = new Set(myAccess?.permissions ?? []);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            toast('A reason is required to save permission changes.', {type: 'error'});
            return;
        }

        // Non-SERVER_ADMIN actors can only submit permissions within their
        // own sphere (plus baseline) — anything else effective on the
        // target (role-derived, or granted by someone else) is left as-is
        // by simply never being resubmitted, rather than risking a rejected
        // save for a permission this actor never touched.
        const editable = unrestricted
            ? selected
            : new Set([...selected].filter((permission) => myPermissions.has(permission)));
        const permissions = Array.from(new Set([...editable, ...BASELINE_PERMISSIONS]));

        try {
            await updateAccess.mutateAsync({cid, permissions, reason: reason.trim()});
            toast('Permissions updated.', {type: 'success'});
            setReason('');
        } catch {
            toast('Failed to update permissions.', {type: 'error'});
        }
    };

    if (catalogLoading || accessLoading || myAccessLoading) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 1}}>Permissions</Typography>
                    <Typography>Loading…</Typography>
                </CardContent>
            </Card>
        );
    }

    if (catalogErrored || accessErrored || myAccessErrored) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 1}}>Permissions</Typography>
                    <Alert severity="error">
                        Could not load Osmium access data. Log in to Osmium (complete the auth bridge) and try
                        again.
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (access?.server_admin) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 1}}>Permissions</Typography>
                    <Alert severity="info">Server admin — managed via environment configuration, not editable
                        here.</Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{mb: 2}}>Permissions</Typography>
                <form action={handleSubmit}>
                    <PermissionsPicker
                        catalog={catalog?.permissions ?? []}
                        selected={selected}
                        onChange={setSelected}
                        locked={new Set(BASELINE_PERMISSIONS)}
                        assignable={unrestricted ? undefined : myPermissions}
                    />
                    <TextField
                        sx={{mt: 2}}
                        required
                        fullWidth
                        variant="filled"
                        label="Reason"
                        helperText="Recorded as a dossier entry on this controller's log."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <Box sx={{mt: 2}}>
                        <FormSaveButton/>
                    </Box>
                </form>
            </CardContent>
        </Card>
    );
}
