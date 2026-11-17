'use client';
import React, {useState} from 'react';
import {Dialog, DialogContent, DialogTitle, Grid, Skeleton, Tooltip, Typography} from "@mui/material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {Visibility} from "@mui/icons-material";
import {useUserProgression} from "@/lib/osmium/hooks/training";
import ProgressionSteps from "@/components/Progression/ProgressionSteps";

function ProgressionStatus({cid}: { cid: number }) {
    const {data: status, isLoading, isError} = useUserProgression(cid);

    if (isLoading) return <Skeleton height={120}/>;
    if (isError) return <Typography color="error">Could not load this controller&apos;s progression.</Typography>;

    const steps = status?.steps ?? [];
    if (steps.length === 0) return <Typography>No progression is assigned.</Typography>;

    return (
        <Grid container columns={11} spacing={1}>
            <ProgressionSteps steps={steps} sessionHref={(id) => `/training/sessions/${id}`}/>
        </Grid>
    );
}

/** Row action that shows a student's progression steps and their outcomes. */
export default function ProgressionAssignmentStatusButton({cid, name}: { cid: number, name: string }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Tooltip title="View Status">
                <GridActionsCellItem icon={<Visibility/>} label="View Status" onClick={() => setOpen(true)}/>
            </Tooltip>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle>{name} - Progression Status</DialogTitle>
                <DialogContent>
                    {/* Mounted only while open, so the table doesn't fetch every student's progression. */}
                    {open && <ProgressionStatus cid={cid}/>}
                </DialogContent>
            </Dialog>
        </>
    );
}
