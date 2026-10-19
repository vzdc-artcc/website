'use client';
import React from 'react';
import {
    Alert,
    Autocomplete,
    Button,
    Chip,
    FormControlLabel,
    IconButton,
    Stack,
    Switch,
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
import {Download, Refresh} from "@mui/icons-material";
import {toast} from "react-toastify";
import {stringify} from "csv-stringify";
import {exportUserData} from "@/actions/userDataExport";

type ExportData = NonNullable<Awaited<ReturnType<typeof exportUserData>>['data']>;

export type ExportableUser = {
    cid: string,
    firstName: string | null,
    lastName: string | null,
    controllerStatus: string,
};

const userLabel = (user: ExportableUser) =>
    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() + ` (${user.cid})${user.controllerStatus === 'NONE' ? ' - Not on roster' : ''}`;

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
    const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
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

export default function UserDataExportForm({users}: { users: ExportableUser[] }) {

    const [cid, setCid] = React.useState('');
    const [redact, setRedact] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    const [data, setData] = React.useState<ExportData | null>(null);

    const generate = async (selectedCid: string, redactThirdParties: boolean) => {
        if (!selectedCid) return;
        setLoading(true);
        const result = await exportUserData(selectedCid, redactThirdParties);
        setLoading(false);
        if (result.error || !result.data) {
            toast.error(result.error || 'Failed to generate export.');
            setData(null);
            return;
        }
        setData(result.data);
        toast.success('Export generated.');
    }

    const prefix = data ? `${data.subject.cid}_${new Date().toISOString().slice(0, 10)}` : '';
    const signups = data?.sections.find((s) => s.key === 'event_signups')?.rows ?? [];
    const attended = signups.filter((s) => s.attendance === 'CONNECTED').length;
    const noShows = signups.filter((s) => s.attendance === 'NO_SHOW').length;
    const totalRecords = data?.sections.reduce((sum, s) => sum + s.rows.length, 0) ?? 0;

    return (
        <Stack direction="column" spacing={2}>
            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2}>
                <Autocomplete
                    fullWidth
                    options={users}
                    getOptionLabel={userLabel}
                    value={users.find((u) => u.cid === cid) || null}
                    onChange={(event, newValue) => {
                        setCid(newValue ? newValue.cid : '');
                        if (newValue) generate(newValue.cid, redact);
                    }}
                    disabled={loading}
                    renderInput={(params) => <TextField {...params} variant="filled" label="User"
                                                        helperText="Anyone who has ever signed in, on the roster or not."/>}
                />
                <Button variant="contained" startIcon={<Refresh/>} disabled={loading || !cid}
                        onClick={() => generate(cid, redact)} sx={{alignSelf: {sm: 'flex-start'}, mt: {sm: 1}}}>
                    {loading ? 'Generating...' : 'Regenerate'}
                </Button>
            </Stack>
            <FormControlLabel
                control={<Switch checked={redact} disabled={loading} onChange={(e) => {
                    setRedact(e.target.checked);
                    if (cid) generate(cid, e.target.checked);
                }}/>}
                label="Redact other people's identities (leave on for GDPR requests)"
            />
            {data && <>
                <Typography variant="h6">{data.subject.name} ({data.subject.cid})</Typography>
                {data.notes.map((note) => <Alert key={note} severity="info">{note}</Alert>)}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={`${totalRecords} records`}/>
                    <Chip label={`${data.sections.filter((s) => s.rows.length > 0).length}/${data.sections.length} sections with data`}/>
                    <Chip label={`${signups.length} event signups`}/>
                    <Chip label={`${attended} attended`} color="success"/>
                    <Chip label={`${noShows} no-shows`} color="error"/>
                    <Chip label={data.thirdPartiesRedacted ? 'Third parties redacted' : 'Third parties NOT redacted'}
                          color={data.thirdPartiesRedacted ? 'default' : 'warning'}/>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button variant="outlined" color="inherit" startIcon={<Download/>}
                            onClick={() => download(JSON.stringify(data, null, 2), 'application/json', `user_export_${prefix}.json`)}>
                        Full Export (JSON)
                    </Button>
                </Stack>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Section</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell align="right">Records</TableCell>
                                <TableCell align="right">CSV</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.sections.map((section) => (
                                <TableRow key={section.key}>
                                    <TableCell>{section.title}</TableCell>
                                    <TableCell>{section.description}</TableCell>
                                    <TableCell align="right">{section.rows.length}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={`Download ${section.title} CSV`}>
                                            <span>
                                                <IconButton size="small" disabled={section.rows.length === 0}
                                                            onClick={() => downloadCsv(section.rows, `${section.key}_${prefix}.csv`)}>
                                                    <Download fontSize="small"/>
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>}
        </Stack>
    );
}
