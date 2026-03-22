"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid2
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import Form from "next/form";
import { toast } from "react-toastify";
import FormSaveButton from "@/components/Form/FormSaveButton";
import { Event, EventPosition, User, TmiCategory } from "@prisma/client";
import { fetchTmis, addTmi, updateTmi, deleteTmi } from "@/actions/tmi";
import TmiDeleteButton from "@/components/EventManager/TmiDeleteButton";

type Props = {
    admin?: boolean;
    currentUser: User;
    event: Event;
    eventPosition?: EventPosition | null;
};

type Row = {
    id: string;
    category: TmiCategory | string;
    text: string;
    createdAt?: string;
};

const CATEGORY_OPTIONS: { value: TmiCategory | string; label: string }[] = [
    { value: "LOCAL", label: "Local" },
    { value: "TERMINAL", label: "Terminal" },
    { value: "ENROUTE", label: "Enroute" },
];

export default function TmiForm({ admin, event, eventPosition }: Props) {
    const [rows, setRows] = useState<Row[] | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    const [newCategory, setNewCategory] = useState<TmiCategory | string>("LOCAL");
    const [newText, setNewText] = useState("");

    const [editOpen, setEditOpen] = useState(false);
    const [editRow, setEditRow] = useState<Row | null>(null);

    const saveDisabled = !admin && (eventPosition || (event as any).positionsLocked);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            // in TmiForm.load()
            const tmis = await fetchTmis(event.id);
            const mapped: Row[] = tmis.map((t: any) => ({
                id: t.id,
                category: String(t.category || 'LOCAL').trim().toUpperCase(),
                text: t.text,
                createdAt: t.createdAt,
            }));
            setRows(mapped);
        } catch (err) {
            console.error("fetchTmis error", err);
            toast.error("Failed to load TMIs");
        } finally {
            setLoading(false);
        }
    }, [event.id]);

    useEffect(() => {
        load();
    }, [load]);

    const columns = useMemo<GridColDef<Row>[]>(() => [
        {
            field: "category",
            headerName: "Category",
            width: 140,
            renderCell: (params) => {
                const v = String(params.row.category || '').toUpperCase();
                if (v === "TERMINAL") return "Terminal";
                if (v === "ENROUTE") return "Enroute";
                return "Local";
            },
        },

        { field: "text", headerName: "TMI", flex: 1, minWidth: 300 },
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            width: 160,
            getActions: (params) => {
                const idStr = String(params.id);
                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        key="edit"
                        onClick={() => {
                            setEditRow(params.row);
                            setEditOpen(true);
                        }}
                    />,
                    <TmiDeleteButton
                        key={`delete-${idStr}`}
                        id={idStr}
                        label="Delete"
                        warningMessage="Are you sure you want to delete this TMI? Click again to confirm."
                        deleteFunction={async (id) => {
                            // wrap deleteTmi to include admin flag if needed and throw on errors
                            const result = await deleteTmi(id, admin);
                            if (result && (result as any).errors) {
                                throw new Error("Failed to delete TMI");
                            }
                            return result;
                        }}
                        onSuccess={async () => {
                            toast.success("TMI deleted successfully!");
                            await load();
                        }}
                    />,
                ];
            },
        },
    ], [admin, load]);

    // Add handler
    const handleAdd = async (formData: FormData) => {
        if (saveDisabled) return;
        formData.set("text", newText);
        formData.set("category", String(newCategory));
        try {
            const res = await addTmi(event.id, formData, admin);
            if ((res as any).errors) {
                toast.error((res as any).errors.map((e: any) => e.message).join(". "));
                return;
            }
            setNewText("");
            setNewCategory("LOCAL");
            toast.success("TMI added");
            load();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add TMI");
        }
    };

    // Edit save
    const handleEditSave = async (formData: FormData) => {
        if (!editRow) return;
        formData.set("text", (formData.get("text") as string) || editRow.text);
        formData.set("category", String(formData.get("category") || editRow.category));
        try {
            const res = await updateTmi(editRow.id, formData, admin);
            if ((res as any).errors) {
                toast.error((res as any).errors.map((e: any) => e.message).join(". "));
                return;
            }
            toast.success("TMI updated");
            setEditOpen(false);
            setEditRow(null);
            load();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update TMI");
        }
    };

    return (
        <>
            {loading && rows === undefined ? (
                <Box sx={{ py: 4 }}>
                    <Typography>Loading TMIs…</Typography>
                </Box>
            ) : rows && rows.length === 0 ? (
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: "background.paper", boxShadow: 1 }}>
                    <Typography variant="h6">No Traffic Management Initiatives</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        This event does not have any Traffic Management Initiatives added. Please add one or more below.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ width: "100%" }}>
                    <DataGrid
                        rows={rows ?? []}
                        columns={columns}
                        loading={loading || rows === undefined}
                        disableRowSelectionOnClick
                        autoHeight
                        pageSizeOptions={[5, 10, 20]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                        getRowId={(r) => r.id}
                        sx={{ mt: 1 }}
                    />
                </Box>

            )}
            <Form action={handleAdd}>
                    <Grid2 container spacing={2} sx={{ mt: 2 }}>
                        <Select
                            value={newCategory}
                            onChange={(e: SelectChangeEvent) => setNewCategory(e.target.value)}
                            size="small"
                            fullWidth
                            name="category"
                        >
                            {CATEGORY_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            placeholder="Traffic Management Initiative"
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            name="text"
                        />
                    </Grid2>
                    <div style={{ marginTop: 16 }}>
                        {saveDisabled ? (
                            <Button variant="contained" disabled startIcon={<SaveIcon />} fullWidth>
                                Save
                            </Button>
                        ) : (
                            <FormSaveButton text="Save" />
                        )}
                    </div>
            </Form>

            {/* Edit dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit TMI</DialogTitle>
                <Form action={handleEditSave}>
                    <DialogContent>
                        <Select
                            fullWidth
                            name="category"
                            value={editRow?.category || "LOCAL"}
                            onChange={(e: any) => setEditRow((r) => (r ? { ...r, category: e.target.value } : r))}
                            sx={{ mb: 2 }}
                        >
                            {CATEGORY_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                        <TextField
                            fullWidth
                            name="text"
                            value={editRow?.text || ""}
                            onChange={(e) => setEditRow((r) => (r ? { ...r, text: e.target.value } : r))}
                            multiline
                            minRows={3}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setEditOpen(false);
                                setEditRow(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
                            Save
                        </Button>
                    </DialogActions>
                </Form>
            </Dialog>
        </>
    );
}
