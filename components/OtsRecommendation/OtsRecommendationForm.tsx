'use client';
import React, {useState} from 'react';
import {User} from "next-auth";
import Form from "next/form";
import {Autocomplete, Stack, TextField} from "@mui/material";
import {useRouter} from "next/navigation";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {manualCreateOtsRec} from "@/actions/ots";
import {toast} from "react-toastify";

export default function OtsRecommendationForm({allStudents}: { allStudents: User[], }) {

    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [notes, setNotes] = useState<string>('');
    const router = useRouter();

    const handleSubmit = async () => {
        if (!selectedStudent || notes.trim() === '') {
            toast.error('Please fill in all required fields.');
            return;
        }

        await manualCreateOtsRec(selectedStudent, notes);
        toast.success('OTS Recommendation created successfully.');
        router.push('/training/ots');
    }

    return (
        <Form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <Autocomplete
                    options={allStudents}
                    getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.cid})`}
                    value={selectedStudent}
                    onChange={(_event, newValue) => setSelectedStudent(newValue)}
                    renderInput={(params) => <TextField {...params} required label="Student"/>}
                />
                <TextField required label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} multiline
                           rows={2}/>
                <FormSaveButton/>
            </Stack>
        </Form>
    );
}