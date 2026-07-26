'use client';
import { useState } from 'react';
import { Autocomplete, Stack, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import FormSaveButton from "@/components/Form/FormSaveButton";
import { toast } from "react-toastify";
import { useCreateOtsRecommendation } from "@/lib/osmium/hooks/training";
import { useRosterControllers } from "@/lib/osmium/hooks/users";

interface StudentOption {
    id: string;
    cid: number;
    name: string;
}

export default function OtsRecommendationForm() {

    const { data: controllers } = useRosterControllers();
    const createOts = useCreateOtsRecommendation();
    const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
    const [notes, setNotes] = useState<string>('');
    const router = useRouter();

    const students: StudentOption[] = (controllers?.items ?? [])
        .filter((u) => !!u.full)
        .map((u) => ({ id: u.full!.id, cid: u.basic.cid, name: `${u.full!.first_name ?? ''} ${u.full!.last_name ?? ''} (${u.basic.cid})`.trim() }));

    const handleSubmit = async () => {
        if (!selectedStudent || notes.trim() === '') {
            toast.error('Please fill in all required fields.');
            return;
        }

        try {
            await createOts.mutateAsync({ student_id: selectedStudent.id, notes: notes.trim() });
            toast.success('OTS Recommendation created successfully.');
            router.push('/training/ots');
        } catch {
            toast.error('Failed to create OTS recommendation.');
        }
    }

    return (
        <form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <Autocomplete
                    options={students}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    value={selectedStudent}
                    onChange={(_event, newValue) => setSelectedStudent(newValue)}
                    renderInput={(params) => <TextField {...params} required label="Student" />}
                />
                <TextField required label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} multiline
                           rows={2} />
                <FormSaveButton />
            </Stack>
        </form>
    );
}
