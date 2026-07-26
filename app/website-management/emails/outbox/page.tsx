'use client';
import React, {useState} from 'react';
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
    TextField,
    Typography
} from "@mui/material";
import Link from "next/link";
import {useEmailOutbox} from "@/lib/osmium/hooks/emails";
import {getTimeAgo} from "@/lib/date";

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    sent: 'success',
    queued: 'default',
    sending: 'warning',
    failed: 'error',
};

export default function Page() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');
    const {data, isLoading, isError} = useEmailOutbox({page, pageSize: 25, status: status || undefined});

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Typography variant="h5">Email Outbox</Typography>
                        <TextField variant="filled" size="small" label="Status" value={status}
                                   onChange={(e) => {
                                       setStatus(e.target.value);
                                       setPage(1);
                                   }}/>
                    </Stack>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    {isLoading && <CircularProgress/>}
                    {isError && <Alert severity="error">Failed to load outbox.</Alert>}
                    {data && data.items.length === 0 && <Typography>No queued emails found.</Typography>}
                    {data && data.items.length > 0 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Template</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Recipients</TableCell>
                                        <TableCell>Delivered</TableCell>
                                        <TableCell>Suppressed</TableCell>
                                        <TableCell>Queued</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.items.map((item) => (
                                        <TableRow key={item.id} hover>
                                            <TableCell>
                                                <Link href={`/website-management/emails/outbox/${item.id}`}
                                                      style={{color: 'inherit',}}>
                                                    {item.template_id}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>
                                                <Chip size="small" label={item.status}
                                                      color={STATUS_COLOR[item.status] ?? 'default'}/>
                                            </TableCell>
                                            <TableCell>{item.recipient_count}</TableCell>
                                            <TableCell>{item.delivered_count}</TableCell>
                                            <TableCell>{item.suppressed_count}</TableCell>
                                            <TableCell>{getTimeAgo(new Date(item.queued_at))}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    {data && (
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mt: 2,}}>
                            <Button disabled={!data.has_prev} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                            <Typography variant="body2">Page {data.page} of {data.total_pages}</Typography>
                            <Button disabled={!data.has_next} onClick={() => setPage((p) => p + 1)}>Next</Button>
                        </Stack>
                    )}
                </CardContent>
            </Card>
        </Stack>
    );
}
