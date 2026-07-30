'use client';
import React, { useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast } from "react-toastify";
import { useStartImpersonation } from "@/lib/osmium/hooks/impersonation";

/**
 * SERVER_ADMIN-only control (this card only renders inside the SERVER_ADMIN-gated
 * Website Management area) to start impersonating the user whose access page this is.
 * Osmium enforces the real guards (SERVER_ADMIN-only permission, refusing self /
 * nested / SERVER_ADMIN targets); this surfaces those as errors.
 */
export default function ImpersonateUserCard({ cid, name }: { cid: number; name: string }) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const start = useStartImpersonation();

    const onConfirm = () => {
        start.mutate(
            { cid, reason },
            {
                onError: (error: unknown) => {
                    const code = (error as { error?: string } | null)?.error;
                    const message =
                        code === 'forbidden'
                            ? 'Cannot impersonate this user (server admins cannot be impersonated).'
                            : code === 'bad_request'
                                ? 'Invalid impersonation target.'
                                : code === 'unauthorized'
                                    ? 'You are not authorized to impersonate.'
                                    : 'Failed to start impersonation.';
                    toast.error(message);
                    setOpen(false);
                },
                // onSuccess navigates away (full reset), so no cleanup needed here.
            },
        );
    };

    return (
        <Card>
            <CardContent>
                <Stack direction="column" spacing={1.5}>
                    <Typography variant="h6">Impersonation</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Temporarily act as {name} for support and debugging. The session resolves as
                        them until you stop; self-service and admin writes are blocked while
                        impersonating, and start/stop is recorded in the server audit log.
                    </Typography>
                    <div>
                        <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<VisibilityIcon />}
                            onClick={() => setOpen(true)}
                        >
                            Impersonate {name}
                        </Button>
                    </div>
                </Stack>
            </CardContent>

            <Dialog open={open} onClose={() => !start.isPending && setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Impersonate {name}?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        You will act as {name} (CID {cid}) until you stop. This is recorded in the
                        server-level audit log, attributed to you.
                    </DialogContentText>
                    <TextField
                        label="Reason (optional)"
                        fullWidth
                        multiline
                        minRows={2}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={start.isPending}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} disabled={start.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={onConfirm}
                        disabled={start.isPending}
                    >
                        {start.isPending ? 'Starting…' : 'Start impersonating'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
