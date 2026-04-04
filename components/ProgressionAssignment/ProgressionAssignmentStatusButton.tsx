'use client';
import React, {useEffect, useState} from 'react';
import {User} from "next-auth";
import {
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List,
    ListItem,
    ListItemIcon,
    Tooltip,
    Typography
} from "@mui/material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {ArrowDownward, Done, QueryStats} from "@mui/icons-material";
import {getProgressionStatus, TrainingProgressionStepStatus} from "@/actions/progressionAssignment";
import {TrainingProgression, TrainingProgressionStep} from "@/generated/prisma/browser";
import {formatZuluDate} from "@/lib/date";
import Link from "next/link";

export default function ProgressionAssignmentStatusButton({user, progression,}: {
    user: User,
    progression: TrainingProgression,
}) {

    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<TrainingProgressionStepStatus[]>();

    useEffect(() => {
        if (!status) {
            getProgressionStatus(user.id).then(setStatus);
        }
    }, [status, user.id]);

    const lastRequiredStep = getLastRequiredStep(status?.map((step) => step.step).flat() || []);


    return (
        <>
            <Tooltip title="View Status">
                <GridActionsCellItem
                    icon={<QueryStats/>}
                    label="View Status"
                    onClick={() => setOpen(true)}
                />
            </Tooltip>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>{user.firstName} {user.lastName} ({user.cid})</DialogTitle>
                <DialogContent>
                    <DialogContentText gutterBottom>
                        Progression: {progression.name}
                    </DialogContentText>
                    <List>
                        {status?.map((step) => (
                            <ListItem key={step.step.id}>
                                <ListItemIcon>
                                    {lastRequiredStep?.id == step.step.id ? <Done/> : <ArrowDownward/>}
                                </ListItemIcon>
                                <Link
                                    href={step.trainingSession ? `/training/sessions/${step.trainingSession.id}` : ''}>
                                    <Chip
                                        label={`${step.step.optional ? '(O)' : ''} ${step.lesson.identifier}`}
                                        size="small"
                                        color={step.passed ? 'success' : step.trainingTicket ? 'error' : 'default'}
                                        style={{margin: '2px'}}
                                    />
                                </Link>
                                {step.trainingSession && <Typography
                                    sx={{ml: 1,}}>Attempted {formatZuluDate(step.trainingSession.start)}</Typography>}
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="inherit">Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

const getLastRequiredStep = (steps: TrainingProgressionStep[]) => {
    return steps.reduce((lastRequiredStep: TrainingProgressionStep | null, step) => {
        if (!step.optional) {
            return step;
        }
        return lastRequiredStep;
    }, null);
}