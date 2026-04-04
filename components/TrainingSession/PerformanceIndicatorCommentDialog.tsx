'use client';
import React, {useState} from 'react';
import {TrainingSessionPerformanceIndicatorCriteria} from "@/generated/prisma/browser";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Tooltip
} from "@mui/material";
import {Comment} from "@mui/icons-material";

export default function PerformanceIndicatorCommentDialog({criteria}: {
    criteria: TrainingSessionPerformanceIndicatorCriteria
}) {

    const [open, setOpen] = useState(false);

    return (
        <>
            <Tooltip title="Open Comment">
                <IconButton size="small" onClick={() => setOpen(true)}>
                    <Comment fontSize="small"/>
                </IconButton>
            </Tooltip>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Comments - {criteria.name}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{criteria.comments}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="inherit" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}