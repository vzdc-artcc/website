'use client';
import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import {useAuditLogs} from "@/lib/osmium/hooks/audit";
import {getTimeAgo} from "@/lib/date";
import {auditActionColor} from "@/lib/audit";

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

function StatePanel({label, value}: { label: string; value: unknown }) {
    return (
        <Box sx={{flex: 1, minWidth: 0}}>
            <Typography variant="overline" color="text.secondary">{label}</Typography>
            <Paper variant="outlined" sx={{p: 1.5, bgcolor: 'background.default', borderRadius: 1}}>
                <Box component="pre" sx={{m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.75rem', fontFamily: MONO}}>
                    {value ? JSON.stringify(value, null, 2) : '—'}
                </Box>
            </Paper>
        </Box>
    );
}

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
                        <Box>
                            <Typography variant="h5" fontWeight={700}>Audit Log</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Every privileged action, newest first. Click a row for before/after state.
                            </Typography>
                        </Box>
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
                    {isLoading && <Box sx={{display: 'flex', justifyContent: 'center', py: 4}}><CircularProgress/></Box>}
                    {isError && <Alert severity="error">Failed to load audit log.</Alert>}
                    {data && data.items.length === 0 && <Typography color="text.secondary">No audit entries found.</Typography>}
                    {data && data.items.length > 0 && (
                        <TableContainer sx={{overflowX: 'auto'}}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{'& th': {fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.5}}}>
                                        <TableCell sx={{width: 40}}/>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Actor</TableCell>
                                        <TableCell>Action</TableCell>
                                        <TableCell>Resource</TableCell>
                                        <TableCell>IP</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.items.map((item) => {
                                        const isOpen = expanded === item.id;
                                        const isSystem = !item.actor_display_name && !item.actor_id;
                                        return (
                                            <React.Fragment key={item.id}>
                                                <TableRow
                                                    hover
                                                    selected={isOpen}
                                                    sx={{cursor: 'pointer', '& td': {borderBottom: isOpen ? 'none' : undefined}}}
                                                    onClick={() => toggleExpanded(item.id)}
                                                >
                                                    <TableCell>
                                                        <IconButton size="small">
                                                            {isOpen ? <ExpandLess/> : <ExpandMore/>}
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip title={new Date(item.created_at).toLocaleString()}>
                                                            <span>{getTimeAgo(new Date(item.created_at))}</span>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        {isSystem ? (
                                                            <Typography variant="body2" color="text.disabled" fontStyle="italic">system</Typography>
                                                        ) : (
                                                            <Typography variant="body2" fontWeight={500}>
                                                                {item.actor_display_name || item.actor_id}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={item.action} size="small" color={auditActionColor(item.action)}
                                                              variant={auditActionColor(item.action) === 'default' ? 'outlined' : 'filled'}/>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" component="span">{item.resource_type}</Typography>
                                                        {item.resource_id &&
                                                            <Typography variant="caption" component="span" sx={{ml: 0.75, color: 'text.secondary', fontFamily: MONO}}>
                                                                {item.resource_id}
                                                            </Typography>}
                                                    </TableCell>
                                                    <TableCell sx={{fontFamily: MONO, fontSize: '0.8rem', color: 'text.secondary'}}>
                                                        {item.ip_address || '—'}
                                                    </TableCell>
                                                </TableRow>
                                                {isOpen && (
                                                    <TableRow selected>
                                                        <TableCell colSpan={6} sx={{py: 2}}>
                                                            <Stack direction={{xs: 'column', md: 'row'}} spacing={2}>
                                                                <StatePanel label="Before" value={item.before_state}/>
                                                                <StatePanel label="After" value={item.after_state}/>
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    {data && data.items.length > 0 && (
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mt: 2}}>
                            <Button variant="outlined" size="small" disabled={!data.has_prev} onClick={() => setPage((p) => p - 1)}>
                                Previous
                            </Button>
                            <Typography variant="body2" color="text.secondary">Page {data.page} of {data.total_pages}</Typography>
                            <Button variant="outlined" size="small" disabled={!data.has_next} onClick={() => setPage((p) => p + 1)}>
                                Next
                            </Button>
                        </Stack>
                    )}
                </CardContent>
            </Card>
        </Stack>
    );
}
