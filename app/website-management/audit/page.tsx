'use client';
import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
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
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import {useAuditLogs} from "@/lib/osmium/hooks/audit";
import {getTimeAgo} from "@/lib/date";

export default function Page() {
    const [page, setPage] = useState(1);
    const [resourceType, setResourceType] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);
    const {data, isLoading, isError} = useAuditLogs({page, pageSize: 25, resourceType: resourceType || undefined});

    const toggleExpanded = (id: string) => setExpanded(expanded === id ? null : id);

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Typography variant="h5">Audit Log</Typography>
                        <TextField variant="filled" label="Resource Type" size="small" value={resourceType}
                                   onChange={(e) => {
                                       setResourceType(e.target.value);
                                       setPage(1);
                                   }}/>
                    </Stack>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    {isLoading && <CircularProgress/>}
                    {isError && <Alert severity="error">Failed to load audit log.</Alert>}
                    {data && data.items.length === 0 && <Typography>No audit entries found.</Typography>}
                    {data && data.items.length > 0 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell/>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Actor</TableCell>
                                        <TableCell>Action</TableCell>
                                        <TableCell>Resource</TableCell>
                                        <TableCell>IP</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.items.map((item) => (
                                        <React.Fragment key={item.id}>
                                            <TableRow hover sx={{cursor: 'pointer',}}
                                                      onClick={() => toggleExpanded(item.id)}>
                                                <TableCell>
                                                    <IconButton size="small">
                                                        {expanded === item.id ? <ExpandLess/> : <ExpandMore/>}
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>{getTimeAgo(new Date(item.created_at))}</TableCell>
                                                <TableCell>{item.actor_display_name || item.actor_id || 'system'}</TableCell>
                                                <TableCell>{item.action}</TableCell>
                                                <TableCell>{item.resource_type}{item.resource_id ? ` (${item.resource_id})` : ''}</TableCell>
                                                <TableCell>{item.ip_address || '—'}</TableCell>
                                            </TableRow>
                                            {expanded === item.id && (
                                                <TableRow>
                                                    <TableCell colSpan={6} sx={{backgroundColor: 'action.hover',}}>
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
                    {data && (
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mt: 2,}}>
                            <Button disabled={!data.has_prev} onClick={() => setPage((p) => p - 1)}>
                                Previous
                            </Button>
                            <Typography variant="body2">Page {data.page} of {data.total_pages}</Typography>
                            <Button disabled={!data.has_next} onClick={() => setPage((p) => p + 1)}>
                                Next
                            </Button>
                        </Stack>
                    )}
                </CardContent>
            </Card>
        </Stack>
    );
}
