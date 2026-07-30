'use client';
import { Autocomplete, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { useUpdateOtsRecommendation } from "@/lib/osmium/hooks/training";

interface InstructorOption {
    id: string;
    cid: number;
    name: string;
}

export default function InstructorDropdown({ recommendationId, instructors, assignedInstructorId }: {
    recommendationId: string;
    instructors: InstructorOption[];
    assignedInstructorId?: string | null;
}) {
    const updateOts = useUpdateOtsRecommendation();
    const selected = instructors.find((i) => i.id === assignedInstructorId) || null;

    return (
        <Autocomplete
            size="small"
            options={instructors}
            getOptionLabel={(i) => i.name}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={selected}
            fullWidth
            onChange={(_e, newValue) => {
                updateOts.mutateAsync({ recommendationId, assignedInstructorId: newValue?.id ?? null })
                    .then(() => toast.success('Instructor assignment updated successfully!'))
                    .catch(() => toast.error('Failed to update instructor assignment.'));
            }}
            renderInput={(params) => (
                <TextField {...params} label={selected ? 'ASSIGNED TO' : 'ASSIGN'} variant="outlined" />
            )}
        />
    );
}
