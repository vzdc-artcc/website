'use client';
import React, {useEffect, useState} from 'react';
import Form from "next/form";
import {Autocomplete, Box, Stack, TextField} from "@mui/material";
import FormSaveButton from '@/components/Form/FormSaveButton';
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {useCreateProgressionAssignment, useTrainingProgressions} from "@/lib/osmium/hooks/training";
import {useRosterControllers} from "@/lib/osmium/hooks/users";

interface ProgressionOption {
    id: string;
    name: string;
}

export default function ProgressionAssignmentForm({currentAssignment}: {
    currentAssignment?: { userId: string, cid: number, displayName: string, progressionId: string },
}) {

    const router = useRouter();
    const {data: rosterData} = useRosterControllers();
    const {data: progressionsData} = useTrainingProgressions();
    const createAssignment = useCreateProgressionAssignment();

    const allStudents = (rosterData?.items ?? [])
        .filter((u) => !!u.full)
        .map((u) => ({id: u.full!.id, cid: u.basic.cid, name: `${u.full!.first_name ?? ''} ${u.full!.last_name ?? ''}`.trim() || u.basic.name}));
    const allProgressions: ProgressionOption[] = progressionsData?.items ?? [];

    const [student, setStudent] = useState<string>(currentAssignment?.userId || '');
    const [progression, setProgression] = useState<ProgressionOption | null>(
        allProgressions.find((p) => p.id === currentAssignment?.progressionId) || null
    );

    useEffect(() => {
        if (currentAssignment) {
            setProgression(allProgressions.find((p) => p.id === currentAssignment.progressionId) || null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [progressionsData, currentAssignment?.progressionId]);

    return (
        <Form action={async () => {
            if (!student) {
                toast.error('Please select a student.');
                return;
            }
            if (!progression) {
                toast.error('Please select a progression.');
                return;
            }

            try {
                await createAssignment.mutateAsync({user_id: student, progression_id: progression.id});
                toast.success('Progression assignment saved successfully!');

                if (!currentAssignment) {
                    setStudent('');
                    setProgression(null);
                    router.push('/training/progressions/assignments');
                }
            } catch {
                toast.error('Failed to save progression assignment.');
            }
        }}>
            <Stack direction="column" spacing={2}>
                <Autocomplete
                    disabled={!!currentAssignment}
                    options={allStudents}
                    getOptionLabel={(option) => `${option.name} (${option.cid})`}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    value={currentAssignment
                        ? {id: currentAssignment.userId, cid: currentAssignment.cid, name: currentAssignment.displayName}
                        : allStudents.find((u) => u.id === student) || null}
                    onChange={(event, newValue) => {
                        setStudent(newValue ? newValue.id : '');
                    }}
                    renderInput={(params) => <TextField {...params} label="Student"/>}
                />
                <Autocomplete
                    options={allProgressions}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    value={progression}
                    onChange={(event, newValue) => {
                        setProgression(newValue);
                    }}
                    renderInput={(params) => <TextField {...params} label="Progression" placeholder="Search by name"/>}
                />
                <Box>
                    <FormSaveButton/>
                </Box>
            </Stack>
        </Form>
    );
}
