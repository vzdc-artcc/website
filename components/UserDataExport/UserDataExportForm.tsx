'use client';
import React from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
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
import {Download, Search} from "@mui/icons-material";
import {toast} from "react-toastify";
import {stringify} from "csv-stringify";
import {exportUserData} from "@/actions/userDataExport";
import {formatZuluDate} from "@/lib/date";

type ExportData = NonNullable<Awaited<ReturnType<typeof exportUserData>>['data']>;

const toCell = (value: unknown) => {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
}

const download = (content: string, type: string, filename: string) => {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

const downloadCsv = async (rows: Record<string, unknown>[], filename: string) => {
    if (rows.length === 0) {
        toast.info('Nothing to export.');
        return;
    }
    const columns = Object.keys(rows[0]);
    const csvContent = await new Promise<string>((resolve, reject) => {
        stringify(rows.map((row) => columns.map((column) => toCell(row[column]))), {
            header: true,
            columns,
        }, (err, output) => {
            if (err) reject(err);
            else resolve(output);
        });
    });
    download(csvContent, 'text/csv;charset=utf-8;', filename);
}

const attendanceColor = (attendance: string) => attendance === 'NO_SHOW' ? 'error' : attendance === 'CONNECTED' ? 'success' : 'default';

export default function UserDataExportForm() {

    const [cid, setCid] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [data, setData] = React.useState<ExportData | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d+$/.test(cid.trim())) {
            toast.error('Enter a numeric CID.');
            return;
        }
        setLoading(true);
        const result = await exportUserData(cid);
        setLoading(false);
        if (result.error || !result.data) {
            toast.error(result.error || 'Failed to generate export.');
            setData(null);
            return;
        }
        setData(result.data);
        toast.success('Export generated.');
    }

    const prefix = data ? `${data.profile.cid}_${new Date().toISOString().slice(0, 10)}` : '';
    const noShows = data?.eventSignups.filter((s) => s.attendance === 'NO_SHOW').length ?? 0;
    const attended = data?.eventSignups.filter((s) => s.attendance === 'CONNECTED').length ?? 0;
    const staffDeletes = data?.auditLog.filter((l) => l.model === 'EVENT_POSITION' && l.type === 'DELETE' && l.relation === 'ABOUT_USER').length ?? 0;

    return (
        <Stack direction="column" spacing={2}>
            <Box component="form" onSubmit={handleSubmit}>
                <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                    <TextField label="CID" value={cid} onChange={(e) => setCid(e.target.value)} size="small"/>
                    <Button type="submit" variant="contained" startIcon={<Search/>} disabled={loading}>
                        {loading ? 'Generating...' : 'Generate Export'}
                    </Button>
                </Stack>
            </Box>
            {data && <>
                <Typography variant="h6">{data.profile.firstName} {data.profile.lastName} ({data.profile.cid})</Typography>
                {data.notes.map((note) => <Alert key={note} severity="info">{note}</Alert>)}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={`${data.eventSignups.length} signups on record`}/>
                    <Chip label={`${attended} attended`} color="success"/>
                    <Chip label={`${noShows} no-shows`} color="error"/>
                    <Chip label={`${staffDeletes} staff deletions logged`} color="warning"/>
                    <Chip label={`${data.auditLog.length} audit log entries`}/>
                    <Chip label={`${data.controllerSessions.length} controller sessions`}/>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button variant="outlined" startIcon={<Download/>}
                            onClick={() => download(JSON.stringify(data, null, 2), 'application/json', `user_export_${prefix}.json`)}>
                        Full Export (JSON)
                    </Button>
                    <Button variant="outlined" startIcon={<Download/>}
                            onClick={() => downloadCsv(data.eventSignups, `event_signups_${prefix}.csv`)}>
                        Event Signups (CSV)
                    </Button>
                    <Button variant="outlined" startIcon={<Download/>}
                            onClick={() => downloadCsv(data.auditLog, `audit_log_${prefix}.csv`)}>
                        Audit Log (CSV)
                    </Button>
                    <Button variant="outlined" startIcon={<Download/>}
                            onClick={() => downloadCsv(data.controllerSessions, `controller_sessions_${prefix}.csv`)}>
                        Controller Sessions (CSV)
                    </Button>
                </Stack>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Event</TableCell>
                                <TableCell>Submitted</TableCell>
                                <TableCell>Requested</TableCell>
                                <TableCell>Final</TableCell>
                                <TableCell>Published</TableCell>
                                <TableCell>Attendance</TableCell>
                                <TableCell>Connected</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.eventSignups.map((signup) => (
                                <TableRow key={signup.eventId}>
                                    <TableCell>{signup.event}<br/>{formatZuluDate(signup.eventStart)}</TableCell>
                                    <TableCell>{formatZuluDate(signup.submittedAt)}</TableCell>
                                    <TableCell>{signup.requestedPosition}</TableCell>
                                    <TableCell>{signup.finalPosition || '-'}</TableCell>
                                    <TableCell>{signup.published ? 'Yes' : 'No'}</TableCell>
                                    <TableCell><Chip size="small" label={signup.attendance}
                                                     color={attendanceColor(signup.attendance)}/></TableCell>
                                    <TableCell>{signup.minutesConnectedInSlot}/{signup.slotMinutes}m {signup.callsignsUsed}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>}
        </Stack>
    );
}
