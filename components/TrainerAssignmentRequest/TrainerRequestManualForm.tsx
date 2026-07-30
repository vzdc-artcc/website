'use client';
import React, {useState} from 'react';
import {Autocomplete, Box, Stack, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import dayjs, {Dayjs} from "dayjs";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import utc from "dayjs/plugin/utc";
import {toast} from "react-toastify";
import {useRosterControllers} from "@/lib/osmium/hooks/users";
import {useCreateTrainingAssignmentRequest} from "@/lib/osmium/hooks/training";

dayjs.extend(utc);

export default function TrainerRequestManualForm() {

    const {data: rosterData, isLoading} = useRosterControllers();
    const createRequest = useCreateTrainingAssignmentRequest();

    const students = (rosterData?.items ?? [])
        .filter((u) => !!u.full)
        .map((u) => ({id: u.full!.id, cid: u.basic.cid, name: `${u.full!.first_name ?? ''} ${u.full!.last_name ?? ''}`.trim() || u.basic.name}));

    const [student, setStudent] = useState<string>('');
    const [submittedTime, setSubmittedTime] = useState<Dayjs | null>(dayjs.utc(new Date()));

    const handleSubmit = async () => {
        if (!student) {
            toast.error('A student is required.');
            return;
        }

        try {
            await createRequest.mutateAsync({
                student_id: student,
                submitted_at: (submittedTime ?? dayjs.utc(new Date())).toISOString(),
            });
            toast.success('Successfully created training assignment request.');
            setStudent('');
            setSubmittedTime(dayjs.utc(new Date()));
        } catch {
            toast.error('Failed to create training assignment request.');
        }
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            <form action={handleSubmit}>
                <Stack direction="column" spacing={2}>
                    <Autocomplete
                        loading={isLoading}
                        options={students}
                        getOptionLabel={(option) => `${option.name} (${option.cid})`}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        value={students.find((u) => u.id === student) || null}
                        onChange={(event, newValue) => {
                            setStudent(newValue ? newValue.id : '');
                        }}
                        renderInput={(params) => <TextField {...params} required label="Student"/>}
                    />
                    <DateTimePicker sx={{width: '100%',}} name="submittedTime" label="Submitted Time (Zulu) *"
                                    value={submittedTime} ampm={false} onChange={setSubmittedTime}/>
                    <Box>
                        <FormSaveButton/>
                    </Box>
                </Stack>
            </form>
        </LocalizationProvider>
    );
}
