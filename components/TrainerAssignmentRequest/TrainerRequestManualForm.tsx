'use client';
import React, {useState} from 'react';
import {User} from "next-auth";
import Form from "next/form";
import {Autocomplete, Box, Stack, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import dayjs, {Dayjs} from "dayjs";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import utc from "dayjs/plugin/utc";
import {manualTrainingAssignmentRequest} from "@/actions/trainingAssignmentRequest";
import {toast} from "react-toastify";

export default function TrainerRequestManualForm({students}: { students: User[], }) {

    dayjs.extend(utc);

    const [student, setStudent] = useState<string>('');
    const [submittedTime, setSubmittedTime] = useState<Dayjs | null>(dayjs.utc(new Date()));

    const handleSubmit = async () => {
        const {
            request,
            errors
        } = await manualTrainingAssignmentRequest(student, submittedTime ? submittedTime.toDate() : new Date());
        if (errors && errors.length > 0) {
            toast.error(errors.join('.  '));
            return;
        }

        toast.success('Successfully created training assignment request.');
        setStudent('');
        setSubmittedTime(dayjs.utc(new Date()));
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            <Form action={handleSubmit}>
                <Stack direction="column" spacing={2}>
                    <Autocomplete
                        options={students}
                        getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.cid})`}
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
            </Form>
        </LocalizationProvider>

    );
}