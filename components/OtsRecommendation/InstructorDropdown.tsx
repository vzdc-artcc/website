'use client';
import React from 'react';
import {User} from "next-auth";
import {Autocomplete, TextField} from "@mui/material";
import {assignOts} from "@/actions/ots";
import {OtsRecommendation} from "@prisma/client";
import {toast} from "react-toastify";

export default function InstructorDropdown({rec, allInstructors, assignedInstructorId,}: {
    rec: OtsRecommendation,
    allInstructors: User[],
    assignedInstructorId?: string | null
}) {

    const [selectedInstructor, setSelectedInstructor] = React.useState<User | null>(allInstructors.find(i => i.id === assignedInstructorId) || null);


    return (
        <Autocomplete
            size="small"
            options={allInstructors}
            getOptionLabel={(i) => `${i.operatingInitials} - ${i.fullName}`}
            value={selectedInstructor}
            fullWidth
            onChange={(_, newValue) => {
                setSelectedInstructor(newValue);
                assignOts(rec.id, newValue || undefined).then(() => toast.success('Instructor assignment updated successfully!')).catch(() => toast.error('Failed to update instructor assignment.'));
            }}
            renderInput={(params) => <TextField {...params} label={selectedInstructor ? 'ASSIGNED TO' : 'ASSIGN'}
                                                variant="outlined"/>}
        />
    );
}