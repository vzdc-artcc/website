"use client";

import React, {useMemo, useState} from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    Typography
} from "@mui/material";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DataGrid, GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import {toast} from "react-toastify";
import FormSaveButton from "@/components/Form/FormSaveButton";
import TmiDeleteButton from "@/components/EventManager/TmiDeleteButton";
import dayjs, {Dayjs} from "dayjs";
import {formatZuluDate} from "@/lib/date";
import {useCreateEventTmi, useDeleteEventTmi, useEventTmis, useUpdateEventTmi} from "@/lib/osmium/hooks/events";

export default function TmiForm({event}: { event: { id: string } }) {
    const {data, isLoading} = useEventTmis(event.id);
    const createTmi = useCreateEventTmi(event.id);
    const updateTmi = useUpdateEventTmi(event.id);
    const deleteTmi = useDeleteEventTmi(event.id);
    const rows = data?.items ?? [];

    const [newType, setNewType] = useState("");
    const [newStart, setNewStart] = useState<Dayjs | null>(dayjs());
    const [newText, setNewText] = useState("");

    const [editOpen, setEditOpen] = useState(false);
    const [editRow, setEditRow] = useState<{ id: string; tmi_type: string; start_time: string; notes?: string | null } | null>(null);

    const columns = useMemo<GridColDef[]>(() => [
        {field: "tmi_type", headerName: "Type", width: 140},
        {field: "start_time", headerName: "Start (UTC)", width: 180, renderCell: (params) => formatZuluDate(new Date(params.row.start_time))},
        {field: "notes", headerName: "Notes", flex: 1, minWidth: 300},
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon/>}
                    label="Edit"
                    key="edit"
                    onClick={() => {
                        setEditRow(params.row as any);
                        setEditOpen(true);
                    }}
                />,
                <TmiDeleteButton
                    key={`delete-${params.id}`}
                    id={String(params.id)}
                    label="Delete"
                    warningMessage="Are you sure you want to delete this TMI? Click again to confirm."
                    deleteFunction={async (id) => deleteTmi.mutateAsync(id)}
                    onSuccess={() => toast.success("TMI deleted successfully!")}
                />,
            ],
        },
    ], [deleteTmi]);

    const handleAdd = async () => {
        if (!newType.trim() || !newStart) {
            toast.error('Please fill out all required fields.');
            return;
        }
        try {
            await createTmi.mutateAsync({tmi_type: newType, start_time: newStart.toISOString(), notes: newText || undefined});
            setNewType("");
            setNewText("");
            toast.success("TMI added");
        } catch {
            toast.error("Failed to add TMI");
        }
    };

    const handleEditSave = async () => {
        if (!editRow) return;
        try {
            await updateTmi.mutateAsync({
                tmiId: editRow.id,
                body: {tmi_type: editRow.tmi_type, start_time: editRow.start_time, notes: editRow.notes},
            });
            toast.success("TMI updated");
            setEditOpen(false);
            setEditRow(null);
        } catch {
            toast.error("Failed to update TMI");
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {rows.length === 0 && !isLoading ? (
                <Box sx={{p: 1, borderRadius: 1, bgcolor: "background.paper", boxShadow: 1}}>
                    <Typography variant="h6">No Traffic Management Initiatives</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                        This event does not have any TMIs added yet. Please add one below.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{width: "100%"}}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        loading={isLoading}
                        disableRowSelectionOnClick
                        autoHeight
                        pageSizeOptions={[5, 10, 20]}
                        initialState={{pagination: {paginationModel: {pageSize: 10, page: 0}}}}
                        sx={{mt: 1}}
                    />
                </Box>
            )}
            <form action={handleAdd}>
                <Grid container spacing={2} sx={{mt: 2}}>
                    <Grid size={{xs: 12, sm: 4}}>
                        <TextField fullWidth label="TMI Type" placeholder="e.g. MIT" value={newType}
                                   onChange={(e) => setNewType(e.target.value)}/>
                    </Grid>
                    <Grid size={{xs: 12, sm: 4}}>
                        <DateTimePicker sx={{width: '100%'}} label="Start" ampm={false} value={newStart}
                                        onChange={setNewStart}/>
                    </Grid>
                    <Grid size={{xs: 12, sm: 4}}>
                        <TextField
                            fullWidth
                            multiline
                            minRows={1}
                            placeholder="Notes (optional)"
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Box sx={{mt: 2}}>
                    <FormSaveButton text="Save" icon={<SaveIcon/>}/>
                </Box>
            </form>

            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit TMI</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Type"
                        value={editRow?.tmi_type || ""}
                        onChange={(e) => setEditRow((r) => (r ? {...r, tmi_type: e.target.value} : r))}
                        sx={{mb: 2, mt: 1}}
                    />
                    <DateTimePicker
                        sx={{width: '100%', mb: 2}}
                        label="Start"
                        ampm={false}
                        value={editRow ? dayjs(editRow.start_time) : null}
                        onChange={(v) => setEditRow((r) => (r && v ? {...r, start_time: v.toISOString()} : r))}
                    />
                    <TextField
                        fullWidth
                        label="Notes"
                        value={editRow?.notes || ""}
                        onChange={(e) => setEditRow((r) => (r ? {...r, notes: e.target.value} : r))}
                        multiline
                        minRows={3}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setEditOpen(false);
                        setEditRow(null);
                    }}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained" startIcon={<SaveIcon/>}>Save</Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
