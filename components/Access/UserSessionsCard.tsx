'use client';
import React, { useState } from 'react';
import {
    Alert,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { getTimeAgo } from "@/lib/date";
import { useUserSessions, useRevokeSession, useRevokeAllSessions } from "@/lib/osmium/hooks/users";

/**
 * Admin session manager for a single user (osmium `/admin/users/{cid}/sessions`).
 * Lists active auth sessions (metadata only — tokens are never returned) and lets an
 * admin revoke one or all. Every revoke is audited server-side.
 */
export default function UserSessionsCard({ cid }: { cid: number }) {
    const { data, isLoading, isError } = useUserSessions(cid);
    const revoke = useRevokeSession(cid);
    const revokeAll = useRevokeAllSessions(cid);
    const [pendingId, setPendingId] = useState<string | null>(null);

    const sessions = data?.items ?? [];

    const handleRevoke = async (id: string) => {
        setPendingId(id);
        try {
            await revoke.mutateAsync(id);
            toast('Session revoked.', { type: 'success' });
        } catch {
            toast('Failed to revoke session.', { type: 'error' });
        } finally {
            setPendingId(null);
        }
    };

    const handleRevokeAll = async () => {
        try {
            await revokeAll.mutateAsync();
            toast('All sessions revoked.', { type: 'success' });
        } catch {
            toast('Failed to revoke sessions.', { type: 'error' });
        }
    };

    return (
        <Card>
            <CardContent>
                <Stack direction="column" spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Typography variant="h6">Active Sessions</Typography>
                        {sessions.length > 0 && (
                            <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={handleRevokeAll}
                                disabled={revokeAll.isPending}
                            >
                                {revokeAll.isPending ? 'Revoking…' : 'Revoke all'}
                            </Button>
                        )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        This controller&apos;s active osmium login sessions. Revoking a session signs it
                        out immediately; every revoke is recorded in the server audit log.
                    </Typography>

                    {isLoading && <CircularProgress />}
                    {isError && <Alert severity="error">Failed to load sessions.</Alert>}
                    {data && sessions.length === 0 && (
                        <Typography color="text.secondary">No active sessions.</Typography>
                    )}

                    {sessions.length > 0 && (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Signed in</TableCell>
                                        <TableCell>Expires</TableCell>
                                        <TableCell>IP</TableCell>
                                        <TableCell>State</TableCell>
                                        <TableCell align="right" />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sessions.map((s) => (
                                        <TableRow key={s.id} hover>
                                            <TableCell>{getTimeAgo(new Date(s.created_at))}</TableCell>
                                            <TableCell>{new Date(s.expires_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <code>{s.ip_address ?? '—'}</code>
                                            </TableCell>
                                            <TableCell>
                                                {s.impersonated ? (
                                                    <Chip
                                                        size="small"
                                                        color="warning"
                                                        label={
                                                            s.impersonator_cid
                                                                ? `Impersonated by ${s.impersonator_cid}`
                                                                : 'Impersonated'
                                                        }
                                                    />
                                                ) : (
                                                    <Chip size="small" variant="outlined" label="Normal" />
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleRevoke(s.id)}
                                                    disabled={pendingId === s.id}
                                                >
                                                    {pendingId === s.id ? 'Revoking…' : 'Revoke'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
