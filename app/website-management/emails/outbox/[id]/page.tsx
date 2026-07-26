'use client';
import React from 'react';
import {useParams} from "next/navigation";
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {useEmailOutboxDetail} from "@/lib/osmium/hooks/emails";
import {getTimeAgo} from "@/lib/date";

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    sent: 'success',
    delivered: 'success',
    queued: 'default',
    sending: 'warning',
    failed: 'error',
    suppressed: 'default',
};

export default function Page() {
    const params = useParams<{ id: string }>();
    const {data: item, isLoading, isError} = useEmailOutboxDetail(params.id);

    if (isLoading) {
        return <CircularProgress/>;
    }

    if (isError || !item) {
        return <Alert severity="error">Outbox item not found.</Alert>;
    }

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                            <Typography variant="h5">{item.template_id}</Typography>
                            <Typography variant="body2" color="text.secondary">{item.category}</Typography>
                        </Box>
                        <Chip label={item.status} color={STATUS_COLOR[item.status] ?? 'default'}/>
                    </Stack>
                    <Grid container spacing={2} sx={{mt: 1,}}>
                        <Grid size={{xs: 12, sm: 6}}>
                            <Typography variant="body2" color="text.secondary">Queued</Typography>
                            <Typography>{getTimeAgo(new Date(item.queued_at))}</Typography>
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <Typography variant="body2" color="text.secondary">Sent</Typography>
                            <Typography>{item.sent_at ? getTimeAgo(new Date(item.sent_at)) : 'Not yet'}</Typography>
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <Typography variant="body2" color="text.secondary">Attempts</Typography>
                            <Typography>{item.attempt_count}</Typography>
                        </Grid>
                        <Grid size={{xs: 12, sm: 6}}>
                            <Typography variant="body2" color="text.secondary">Next Attempt</Typography>
                            <Typography>{getTimeAgo(new Date(item.next_attempt_at))}</Typography>
                        </Grid>
                        {item.subject_override && (
                            <Grid size={12}>
                                <Typography variant="body2" color="text.secondary">Subject Override</Typography>
                                <Typography>{item.subject_override}</Typography>
                            </Grid>
                        )}
                        {item.last_error && (
                            <Grid size={12}>
                                <Alert severity="error">{item.last_error}</Alert>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 2,}}>Recipients</Typography>
                    {item.recipients.length === 0 && <Typography>No recipients recorded.</Typography>}
                    {item.recipients.length > 0 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Sent</TableCell>
                                        <TableCell>Error</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {item.recipients.map((recipient) => (
                                        <TableRow key={recipient.id}>
                                            <TableCell>{recipient.display_name ? `${recipient.display_name} <${recipient.email}>` : recipient.email}</TableCell>
                                            <TableCell>
                                                <Chip size="small" label={recipient.delivery_status}
                                                      color={STATUS_COLOR[recipient.delivery_status] ?? 'default'}/>
                                            </TableCell>
                                            <TableCell>{recipient.sent_at ? getTimeAgo(new Date(recipient.sent_at)) : '—'}</TableCell>
                                            <TableCell>{recipient.last_error || recipient.suppression_reason || '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 1,}}>Payload</Typography>
                    <Typography component="pre" variant="body2" sx={{whiteSpace: 'pre-wrap', fontSize: '0.75rem',}}>
                        {JSON.stringify(item.payload, null, 2)}
                    </Typography>
                </CardContent>
            </Card>
        </Stack>
    );
}
