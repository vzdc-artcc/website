"use client";

import React, {useMemo, useState} from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";
import {DataGrid, GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import {toast} from "react-toastify";
import FormSaveButton from "@/components/Form/FormSaveButton";
import TmiDeleteButton from "@/components/EventManager/TmiDeleteButton";
import {useCreateEventTmi, useDeleteEventTmi, useEventTmis, useUpdateEventTmi} from "@/lib/osmium/hooks/events";

// Selectable Traffic Management Initiative types.
const TMI_TYPES = ["Local", "Terminal", "Enroute"] as const;

export default function TmiForm({event}: { event: { id: string } }) {
    const {data, isLoading} = useEventTmis(event.id);
    const createTmi = useCreateEventTmi(event.id);
    const updateTmi = useUpdateEventTmi(event.id);
    const deleteTmi = useDeleteEventTmi(event.id);
    const rows = data?.items ?? [];

    const [newType, setNewType] = useState("");
    const [newText, setNewText] = useState("");

    const [editOpen, setEditOpen] = useState(false);
    const [editRow, setEditRow] = useState<{ id: string; tmi_type: string; notes?: string | null } | null>(null);

    const columns = useMemo<GridColDef[]>(() => [
        {field: "tmi_type", headerName: "Type", width: 140},
        {field: "notes", headerName: "Traffic Management Initiative", flex: 1, minWidth: 300},
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
        if (!newType.trim() || !newText.trim()) {
            toast.error('Please select a type and enter the initiative.');
            return;
        }
        try {
            await createTmi.mutateAsync({tmi_type: newType, notes: newText.trim()});
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
                body: {tmi_type: editRow.tmi_type, notes: editRow.notes},
            });
            toast.success("TMI updated");
            setEditOpen(false);
            setEditRow(null);
        } catch {
            toast.error("Failed to update TMI");
        }
    };

    return (
        <>
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
                <Grid container spacing={2} sx={{mt: 2}} alignItems="center">
                    <Grid size={{xs: 12, sm: 3}}>
                        <FormControl fullWidth>
                            <InputLabel id="tmi-type-label">TMI Type</InputLabel>
                            <Select
                                labelId="tmi-type-label"
                                label="TMI Type"
                                value={newType}
                                onChange={(e) => setNewType(e.target.value)}
                            >
                                {TMI_TYPES.map((t) => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{xs: 12, sm: 9}}>
                        <TextField
                            fullWidth
                            placeholder="Traffic Management Initiative"
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
                    <FormControl fullWidth sx={{mb: 2, mt: 1}}>
                        <InputLabel id="edit-tmi-type-label">Type</InputLabel>
                        <Select
                            labelId="edit-tmi-type-label"
                            label="Type"
                            value={editRow?.tmi_type || ""}
                            onChange={(e) => setEditRow((r) => (r ? {...r, tmi_type: e.target.value} : r))}
                        >
                            {TMI_TYPES.map((t) => (
                                <MenuItem key={t} value={t}>{t}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        placeholder="Traffic Management Initiative"
                        value={editRow?.notes || ""}
                        onChange={(e) => setEditRow((r) => (r ? {...r, notes: e.target.value} : r))}
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
        </>
    );
}
