'use client';
import React, {useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControlLabel,
    MenuItem,
    Stack,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";
import {Search} from "@mui/icons-material";
import {DataGrid, GridColDef, GridRowSelectionModel} from '@mui/x-data-grid';
import {toast} from "react-toastify";
import {usePurgeCandidates, useUpdateControllerLifecycle} from "@/lib/osmium/hooks/controllerLifecycle";
import {useMe} from "@/lib/osmium/hooks/me";
import {useHasStaffPosition} from "@/lib/osmium/hooks/staff-positions";
import {formatZuluDate} from "@/lib/date";

const months = [
    {value: 0, label: 'January'},
    {value: 1, label: 'February'},
    {value: 2, label: 'March'},
    {value: 3, label: 'April'},
    {value: 4, label: 'May'},
    {value: 5, label: 'June'},
    {value: 6, label: 'July'},
    {value: 7, label: 'August'},
    {value: 8, label: 'September'},
    {value: 9, label: 'October'},
    {value: 10, label: 'November'},
    {value: 11, label: 'December'},
];

export default function PurgeAssistantView() {
    const {data: me} = useMe();
    const currentUserCid = me?.cid ?? NaN;
    const {has: canPurge} = useHasStaffPosition(['ATM', 'DATM']);
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [startMonth, setStartMonth] = useState(0);
    const [endMonth, setEndMonth] = useState(11);
    const [maxHours, setMaxHours] = useState(3);
    const [includeLoas, setIncludeLoas] = useState(false);
    const [submitted, setSubmitted] = useState({year, startMonth, endMonth});

    const {data, isLoading} = usePurgeCandidates(submitted);
    const updateLifecycle = useUpdateControllerLifecycle();

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [clickedOnce, setClickedOnce] = useState(false);
    const [purging, setPurging] = useState(false);
    const [selectedRoster, setSelectedRoster] = useState<'home' | 'visit'>('home');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (startMonth > endMonth) {
            toast("Start month cannot be after end month", {type: 'error'});
            return;
        }
        setSubmitted({year, startMonth, endMonth});
        setSelectedIds([]);
    };

    const handleSelectionChange = (model: GridRowSelectionModel) => {
        setSelectedIds(Array.from(model.ids, Number));
    };

    const handlePurge = async () => {
        if (selectedIds.includes(currentUserCid)) {
            toast("You cannot purge yourself.", {type: "error"});
            return;
        }
        if (!clickedOnce) {
            toast("THIS ACTION IS IRREVERSIBLE. Any staff positions or training positions will be removed. Click again to confirm purge.", {type: "warning"});
            setClickedOnce(true);
            return;
        }

        setPurging(true);
        const results = await Promise.allSettled(
            selectedIds.map((cid) => updateLifecycle.mutateAsync({cid, controllerStatus: 'NONE'}))
        );
        const failed = results.filter((r) => r.status === 'rejected').length;
        const succeeded = results.length - failed;

        if (succeeded > 0) {
            toast(`Purged ${succeeded} controller${succeeded === 1 ? '' : 's'}.`, {type: "success"});
        }
        if (failed > 0) {
            toast(`Failed to purge ${failed} controller${failed === 1 ? '' : 's'}.`, {type: "error"});
        }

        setClickedOnce(false);
        setPurging(false);
        setSelectedIds([]);
    };

    const candidates = (data?.items ?? [])
        .filter((item) => includeLoas || !item.has_active_approved_loa)
        .filter((item) => item.open_broadcasts > 0 || item.total_hours < maxHours);

    const columns: GridColDef[] = [
        {field: 'display_name', headerName: 'Controller', flex: 1},
        {field: 'cid', headerName: 'CID', flex: 1},
        {field: 'email', headerName: 'Email', flex: 1},
        {field: 'rating', headerName: 'Rating', flex: 1},
        {field: 'controlling_hours', headerName: 'C Hrs', flex: 1, type: 'number'},
        {field: 'trainer_hours_given', headerName: 'Trainer Hrs', flex: 1, type: 'number'},
        {field: 'trainer_hours_received', headerName: 'Training Hrs', flex: 1, type: 'number'},
        {field: 'total_hours', headerName: 'Total Hrs', flex: 1, type: 'number'},
        {
            field: 'join_date',
            headerName: 'Joined',
            flex: 1,
            valueGetter: (value) => formatZuluDate(new Date(value)),
        },
        {field: 'open_broadcasts', headerName: 'Open Broadcasts', flex: 1, type: 'number'},
    ];

    const rows = candidates.map((item) => ({id: item.cid, ...item}));

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5" fontWeight="bold" sx={{
                        p: 2,
                        border: 4,
                        borderColor: 'red',
                        borderRadius: '8px',
                    }}>Roster Purge Assistant</Typography>
                    <Box sx={{my: 2,}}>
                        <form onSubmit={handleSearchSubmit}>
                            <Stack direction={{xs: 'column', md: 'row'}} spacing={2} alignItems="center">
                                <TextField
                                    required
                                    fullWidth
                                    type="number"
                                    label="Year"
                                    variant="filled"
                                    value={year}
                                    onChange={(e) => setYear(parseInt(e.target.value))}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    select
                                    label="Start Month"
                                    variant="filled"
                                    value={startMonth}
                                    onChange={(e) => setStartMonth(parseInt(e.target.value))}
                                >
                                    {months.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    required
                                    fullWidth
                                    select
                                    label="End Month"
                                    variant="filled"
                                    value={endMonth}
                                    onChange={(e) => setEndMonth(parseInt(e.target.value))}
                                >
                                    {months.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Stack>
                            <TextField
                                sx={{mt: 1,}}
                                required
                                fullWidth
                                type="number"
                                label="Max Hours"
                                variant="filled"
                                value={maxHours}
                                onChange={(e) => setMaxHours(parseInt(e.target.value))}
                                helperText="This will show all controllers that have less than this amount of hours (including training hours)"
                            />
                            <FormControlLabel
                                control={<Switch checked={includeLoas} onChange={(e) => setIncludeLoas(e.target.checked)}/>}
                                label="Include LOAs?"
                            />
                            <Box sx={{my: 1,}}>
                                <Button type="submit" variant="contained" startIcon={<Search/>} size="large">Search</Button>
                            </Box>
                            <Typography variant="caption" gutterBottom>Controllers that are OBS rated with a training
                                assignment request are hidden.</Typography>
                            <br/>
                            <Typography variant="caption">Controllers with an un-reviewed broadcast are shown
                                regardless of hours.</Typography>
                        </form>
                    </Box>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6">
                        {isLoading ? 'Loading…' : `Found ${candidates.length} Combined Controller(s)`}
                    </Typography>
                    {!isLoading && candidates.length === 0 && <Typography>No controllers match criteria</Typography>}
                    {!isLoading && candidates.length > 0 && (
                        <Box>
                            <Tabs variant="fullWidth" value={selectedRoster}
                                  onChange={(_, newValue) => setSelectedRoster(newValue)}>
                                <Tab label="Home" value="home"/>
                                <Tab label="Visiting" value="visit"/>
                            </Tabs>
                            <Box hidden={selectedRoster !== 'home'}>
                                <DataGrid
                                    initialState={{sorting: {sortModel: [{field: 'total_hours', sort: 'desc'}]}}}
                                    rows={rows.filter((row) => row.controller_status === 'HOME')}
                                    columns={columns}
                                    sortingMode="client"
                                    filterMode="client"
                                    disableRowSelectionOnClick
                                    checkboxSelection
                                    onRowSelectionModelChange={handleSelectionChange}
                                    showToolbar
                                />
                            </Box>
                            <Box hidden={selectedRoster !== 'visit'}>
                                <DataGrid
                                    initialState={{sorting: {sortModel: [{field: 'total_hours', sort: 'desc'}]}}}
                                    rows={rows.filter((row) => row.controller_status === 'VISITOR')}
                                    columns={columns}
                                    sortingMode="client"
                                    filterMode="client"
                                    disableRowSelectionOnClick
                                    checkboxSelection
                                    onRowSelectionModelChange={handleSelectionChange}
                                    showToolbar
                                />
                            </Box>
                            <Typography variant="h5" sx={{
                                border: 4,
                                borderRadius: 3,
                                borderColor: 'lightgreen',
                                p: 2,
                                my: 1,
                            }}><b>{selectedRoster.toUpperCase()}</b> ROSTER PURGE ONLY</Typography>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{mt: 2,}}>
                                <Button variant="contained" color="error"
                                        disabled={purging || !canPurge || selectedIds.length === 0}
                                        size="large"
                                        sx={{mt: 2,}}
                                        onClick={handlePurge}>
                                    Purge {selectedIds.length} controller{selectedIds.length === 1 ? '' : 's'}
                                </Button>
                                {clickedOnce && (
                                    <Button variant="contained" color="warning" size="large" onClick={() => {
                                        setClickedOnce(false);
                                    }}>Cancel</Button>
                                )}
                            </Stack>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Stack>
    );
}
