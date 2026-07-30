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
import { useUserIpHistory } from "@/lib/osmium/hooks/users";
import { getTimeAgo } from "@/lib/date";

function statusColor(status: number): 'success' | 'warning' | 'error' | 'default' {
    if (status >= 500) return 'error';
    if (status >= 400) return 'warning';
    if (status >= 200 && status < 300) return 'success';
    return 'default';
}

/**
 * Per-user durable request-IP history (osmium spec 011,
 * GET /admin/users/{cid}/ip-history). Read-only forensic view for admins.
 */
export default function UserIpHistoryCard({ cid }: { cid: number }) {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useUserIpHistory(cid, page);

    return (
        <Card>
            <CardContent>
                <Stack direction="column" spacing={1.5}>
                    <Typography variant="h6">Request IP History</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Durable per-request metadata recorded for this controller (method, matched
                        route, status, IP). Reads and unauthenticated traffic are included; bodies and
                        query strings are not stored.
                    </Typography>

                    {isLoading && <CircularProgress />}
                    {isError && <Alert severity="error">Failed to load IP history.</Alert>}
                    {data && data.items.length === 0 && (
                        <Typography color="text.secondary">No recorded requests for this controller.</Typography>
                    )}

                    {data && data.items.length > 0 && (
                        <>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Time</TableCell>
                                            <TableCell>IP</TableCell>
                                            <TableCell>Method</TableCell>
                                            <TableCell>Route</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.items.map((item, idx) => (
                                            <TableRow key={`${item.created_at}-${idx}`} hover>
                                                <TableCell>{getTimeAgo(new Date(item.created_at))}</TableCell>
                                                <TableCell>
                                                    <code>{item.ip_address}</code>
                                                </TableCell>
                                                <TableCell>{item.method}</TableCell>
                                                <TableCell>
                                                    <code style={{ fontSize: '0.8rem' }}>{item.matched_path}</code>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        size="small"
                                                        label={item.status_code}
                                                        color={statusColor(item.status_code)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Button disabled={!data.pagination.has_prev} onClick={() => setPage((p) => p - 1)}>
                                    Previous
                                </Button>
                                <Typography variant="body2">
                                    Page {data.pagination.page} of {data.pagination.total_pages}
                                </Typography>
                                <Button disabled={!data.pagination.has_next} onClick={() => setPage((p) => p + 1)}>
                                    Next
                                </Button>
                            </Stack>
                        </>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
