'use client';
import React, {useMemo, useState} from 'react';
import FormSaveButton from "@/components/Form/FormSaveButton";
import {Autocomplete, Box, Chip, CircularProgress, Stack, TextField} from "@mui/material";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {useRosterControllers, useUsersByRole} from "@/lib/osmium/hooks/users";
import {
    useCreateTrainingAssignment,
    useDeleteTrainingAssignmentRequest,
    useTrainingAssignments,
    useUpdateTrainingAssignment,
} from "@/lib/osmium/hooks/training";

interface AssignmentLike {
    id: string;
    student_id: string;
    student_cid: number;
    student_name: string;
    primary_trainer_id: string;
    other_trainer_ids: string[];
}

interface RequestLike {
    id: string;
    student_id: string;
    student_cid: number;
    student_name: string;
}

export default function TrainingAssignmentForm({
                                                    assignment,
                                                    trainingRequest,
                                                    disabled,
                                                }: {
    assignment?: AssignmentLike,
    trainingRequest?: RequestLike,
    disabled?: boolean,
}) {
    const router = useRouter();
    const createAssignment = useCreateTrainingAssignment();
    const updateAssignment = useUpdateTrainingAssignment();
    const deleteRequest = useDeleteTrainingAssignmentRequest();
    const {data: rosterData, isLoading: rosterLoading} = useRosterControllers();
    const {data: instructorsData, isLoading: instructorsLoading} = useUsersByRole('INS');
    const {data: mentorsData, isLoading: mentorsLoading} = useUsersByRole('MTR');
    const {data: assignmentsData} = useTrainingAssignments();

    const [student, setStudent] = useState<string | undefined>(assignment?.student_id ?? trainingRequest?.student_id);
    const [primaryTrainer, setPrimaryTrainer] = useState<string | undefined>(assignment?.primary_trainer_id);
    const [otherTrainers, setOtherTrainers] = useState<string[]>(assignment?.other_trainer_ids ?? []);

    const students = (rosterData?.items ?? [])
        .filter((u) => !!u.full)
        .map((u) => ({id: u.full!.id, cid: u.basic.cid, name: `${u.full!.first_name ?? ''} ${u.full!.last_name ?? ''}`.trim() || u.basic.name}));

    const trainers = useMemo(() => {
        const merged = new Map<string, { id: string, cid: number, name: string }>();
        for (const item of [...(instructorsData?.items ?? []), ...(mentorsData?.items ?? [])]) {
            if (!item.full) continue;
            merged.set(item.full.id, {
                id: item.full.id,
                cid: item.basic.cid,
                name: `${item.full.first_name ?? ''} ${item.full.last_name ?? ''}`.trim() || item.basic.name,
            });
        }
        const counts = new Map<string, { primary: number, secondary: number }>();
        for (const a of assignmentsData?.items ?? []) {
            const primaryCount = counts.get(a.primary_trainer_id) ?? {primary: 0, secondary: 0};
            primaryCount.primary += 1;
            counts.set(a.primary_trainer_id, primaryCount);
            for (const other of a.other_trainers) {
                const otherCount = counts.get(other.id) ?? {primary: 0, secondary: 0};
                otherCount.secondary += 1;
                counts.set(other.id, otherCount);
            }
        }
        return Array.from(merged.values()).map((t) => ({
            ...t,
            primary: counts.get(t.id)?.primary ?? 0,
            secondary: counts.get(t.id)?.secondary ?? 0,
        }));
    }, [instructorsData, mentorsData, assignmentsData]);

    const loading = rosterLoading || instructorsLoading || mentorsLoading;

    const handleSubmit = async () => {
        if (!student || !primaryTrainer) {
            toast.error('Student and primary trainer are required.');
            return;
        }

        try {
            let assignmentId: string;
            if (assignment) {
                const updated = await updateAssignment.mutateAsync({
                    assignmentId: assignment.id,
                    body: {primary_trainer_id: primaryTrainer, other_trainer_ids: otherTrainers},
                });
                assignmentId = updated!.id;
            } else {
                const created = await createAssignment.mutateAsync({
                    student_id: student,
                    primary_trainer_id: primaryTrainer,
                    other_trainer_ids: otherTrainers,
                });
                assignmentId = created!.id;
                if (trainingRequest) {
                    await deleteRequest.mutateAsync(trainingRequest.id);
                }
            }

            toast.success('Training assignment saved successfully!');
            if (!assignment) {
                router.push(`/training/assignments/${assignmentId}`);
            }
        } catch {
            toast.error('Failed to save training assignment.');
        }
    };

    if (loading) {
        return <CircularProgress/>;
    }

    return (
        <form action={handleSubmit}>
        <Stack direction="column" spacing={2}>
            <Autocomplete
                disabled={!!trainingRequest || !!assignment || disabled}
                options={students}
                getOptionLabel={(option) => `${option.name} (${option.cid})`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                value={students.find((u) => u.id === student) || (trainingRequest ? {
                    id: trainingRequest.student_id,
                    cid: trainingRequest.student_cid,
                    name: trainingRequest.student_name,
                } : null)}
                onChange={(event, newValue) => {
                    setStudent(newValue ? newValue.id : undefined);
                }}
                renderInput={(params) => <TextField {...params} required label="Student"/>}
            />
            <Autocomplete
                options={trainers}
                disabled={disabled}
                getOptionLabel={(option) => `${option.primary}P ${option.secondary}S - ${option.name} (${option.cid})`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                value={trainers.find((u) => u.id === primaryTrainer) || null}
                onChange={(event, newValue) => {
                    setPrimaryTrainer(newValue ? newValue.id : undefined);
                    if (newValue && otherTrainers.includes(newValue.id)) {
                        setOtherTrainers((prev) => prev.filter((id) => id !== newValue.id));
                    }
                }}
                renderInput={(params) => <TextField {...params} required label="Primary Trainer"
                                                    helperText="Key: <# PRIMARY STUDENTS>P <# SECONDARY STUDENTS>S - <NAME + CID>"/>}
            />
            <Autocomplete
                multiple
                disabled={disabled}
                options={trainers}
                getOptionLabel={(option) => `${option.primary}P ${option.secondary}S - ${option.name} (${option.cid})`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                value={trainers.filter((u) => otherTrainers.includes(u.id))}
                onChange={(event, newValue) => {
                    if (newValue.some((trainer) => trainer.id === primaryTrainer)) {
                        toast.error('Primary trainer cannot be selected as an additional trainer.');
                    } else {
                        setOtherTrainers(newValue.map((trainer) => trainer.id));
                    }
                }}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip {...getTagProps({index})} key={option.id} label={option.name}/>
                    ))
                }
                renderInput={(params) => <TextField {...params} label="Other Trainers"
                                                    helperText="Key: <# PRIMARY STUDENTS>P <# SECONDARY STUDENTS>S - <NAME + CID>"/>}
            />
            {!disabled && <Box>
                <FormSaveButton/>
            </Box>}
        </Stack>
        </form>
    );
}
