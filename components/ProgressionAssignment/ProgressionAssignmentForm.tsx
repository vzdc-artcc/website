'use client';
import React, {useState} from 'react';
import {User} from "next-auth";
import {TrainingProgression} from "@/generated/prisma/browser";
import Form from "next/form";
import {Autocomplete, Box, Stack, TextField} from "@mui/material";
import FormSaveButton from '@/components/Form/FormSaveButton';
import {setProgressionAssignment} from "@/actions/progressionAssignment";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function ProgressionAssignmentForm({allUsers, allProgressions, currentAssignment,}: {
    allUsers: User[],
    allProgressions: TrainingProgression[],
    currentAssignment?: { progression: TrainingProgression, user: User },
}) {

    const router = useRouter();
    const [student, setStudent] = useState<string>(currentAssignment?.user.id || '');
    const [progression, setProgression] = useState<TrainingProgression | null>(currentAssignment?.progression || null);

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
            await setProgressionAssignment(currentAssignment ? currentAssignment.user.id : student, progression.id);
            toast.success('Progression assignment saved successfully!');

            if (!currentAssignment) {
                setStudent('');
                setProgression(null);
                router.push('/training/progressions/assignments');
            }
        }}>
            <Stack direction="column" spacing={2}>
                <Autocomplete
                    disabled={!!currentAssignment}
                    options={allUsers}
                    getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.cid})`}
                    value={allUsers.find((u) => u.id === student) || null}
                    onChange={(event, newValue) => {
                        setStudent(newValue ? newValue.id : '');
                    }}
                    renderInput={(params) => <TextField {...params} label="Student"/>}
                />
                <Autocomplete
                    options={allProgressions}
                    getOptionLabel={(option) => option.name}
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