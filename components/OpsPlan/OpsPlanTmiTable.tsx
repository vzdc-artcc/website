import React from "react";
import {
    Box,
    Paper,
    Stack,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { formatZuluDate } from "@/lib/date";

type TmiLike = {
    id?: string;
    category?: string | null;
    text?: string | null;
    createdAt?: string | Date | null;
};

type TmiCategory = "LOCAL" | "TERMINAL" | "ENROUTE";

function getCategoryLabel(category: string | null | undefined): string {
    const normalized = String(category || "LOCAL").toUpperCase();
    if (normalized === "TERMINAL") return "Terminal";
    if (normalized === "ENROUTE") return "Enroute";
    return "Local";
}

function getNormalizedCategory(category: string | null | undefined): TmiCategory {
    const normalized = String(category || "LOCAL").toUpperCase();
    if (normalized === "TERMINAL") return "TERMINAL";
    if (normalized === "ENROUTE") return "ENROUTE";
    return "LOCAL";
}

export default function OpsPlanTmiTable({ tmis }: { tmis: TmiLike[] }) {
    const grouped: Record<TmiCategory, TmiLike[]> = {
        LOCAL: [],
        TERMINAL: [],
        ENROUTE: [],
    };

    for (const tmi of tmis) {
        grouped[getNormalizedCategory(tmi.category)].push(tmi);
    }

    const categoryOrder: TmiCategory[] = ["LOCAL", "TERMINAL", "ENROUTE"];

    return (
        <Paper sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Traffic Management Initiatives</Typography>

            {tmis.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No TMIs are currently listed for this event.
                </Typography>
            ) : (
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {categoryOrder.map((category) => {
                        const rows = grouped[category];
                        const label = getCategoryLabel(category);

                        return (
                            <Box key={category}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "40vh" }}>
                                    <Table stickyHeader size="small" aria-label={`${label.toLowerCase()} tmi table`}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>TMI</TableCell>
                                                <TableCell sx={{ minWidth: 190 }}>Created (UTC)</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={2}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            No TMIs in this category.
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : rows.map((tmi, idx) => {
                                                const created = tmi.createdAt ? formatZuluDate(tmi.createdAt as Date) : "-";
                                                return (
                                                    <TableRow key={tmi.id || `${category}-tmi-${idx}`}>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                                                {String(tmi.text || "-")}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {created}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        );
                    })}
                </Stack>
            )}
        </Paper>
    );
}

