'use client';
import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import {useAuditLogs} from "@/lib/osmium/hooks/audit";
import {getTimeAgo} from "@/lib/date";

const PAGE_SIZE = 25;

export default function AuditLogTable({resourceTypes}: { resourceTypes?: string[] }) {
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState<string | null>(null);
    const {data, isLoading, isError} = useAuditLogs({pageSize: 200});

    const allowed = resourceTypes ? new Set(resourceTypes) : null;
    const filtered = (data?.items ?? []).filter((item) => !allowed || allowed.has(item.resource_type));
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const toggleExpanded = (id: string) => setExpanded(expanded === id ? null : id);

    return (
        <Stack direction="column" spacing={2}>
            {isLoading && <CircularProgress/>}
            {isError && <Alert severity="error">Failed to load activity log.</Alert>}
            {data && filtered.length === 0 && <Typography>No activity found.</Typography>}
            {data && filtered.length > 0 && (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell/>
                                <TableCell>Time</TableCell>
                                <TableCell>Actor</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>Resource</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pageItems.map((item) => (
                                <React.Fragment key={item.id}>
                                    <TableRow hover sx={{cursor: 'pointer',}} onClick={() => toggleExpanded(item.id)}>
                                        <TableCell>
                                            <IconButton size="small">
                                                {expanded === item.id ? <ExpandLess/> : <ExpandMore/>}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>{getTimeAgo(new Date(item.created_at))}</TableCell>
                                        <TableCell>{item.actor_display_name || item.actor_id || 'system'}</TableCell>
                                        <TableCell>{item.action}</TableCell>
                                        <TableCell>{item.resource_type}{item.resource_id ? ` (${item.resource_id})` : ''}</TableCell>
                                    </TableRow>
                                    {expanded === item.id && (
                                        <TableRow>
                                            <TableCell colSpan={5} sx={{backgroundColor: 'action.hover',}}>
                                                <Stack direction={{xs: 'column', md: 'row',}} spacing={2}>
                                                    <Box sx={{flex: 1,}}>
                                                        <Typography variant="subtitle2">Before</Typography>
                                                        <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.75rem',}}>
                                                            {item.before_state ? JSON.stringify(item.before_state, null, 2) : '—'}
                                                        </pre>
                                                    </Box>
                                                    <Box sx={{flex: 1,}}>
                                                        <Typography variant="subtitle2">After</Typography>
                                                        <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.75rem',}}>
                                                            {item.after_state ? JSON.stringify(item.after_state, null, 2) : '—'}
                                                        </pre>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            {data && filtered.length > 0 && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                    <Typography variant="body2">Page {page} of {totalPages}</Typography>
                    <Button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                </Stack>
            )}
        </Stack>
    );
}
