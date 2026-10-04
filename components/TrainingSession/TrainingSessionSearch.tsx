'use client';
import React from 'react';
import {Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField} from "@mui/material";
import {usePathname, useRouter} from "next/navigation";

export default function TrainingSessionSearch({trainer, student}: { trainer?: string, student?: string }) {

    const router = useRouter();
    const pathname = usePathname();

    const handleSubmit = async (formData: FormData) => {
        const user = formData.get('user') as string;
        const q = formData.get('q') as string;
        const searchParams = new URLSearchParams();
        if (user === 'student') {
            searchParams.set('student', q);
        } else {
            searchParams.set('trainer', q);
        }
        router.push(`${pathname}?${searchParams.toString()}`);
    }

    return (
        <form action={handleSubmit}>
            <Stack direction={{xs: 'column', md: 'row'}} spacing={1} sx={{
                alignItems: "center"
            }}>
                <FormControl fullWidth>
                    <InputLabel id="user-select-label">User</InputLabel>
                    <Select
                        variant="filled"
                        labelId="user-select-label"
                        id="user-select"
                        name="user"
                        defaultValue={student && 'student' || trainer && 'trainer' || 'student'}
                        label="User"
                    >
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="trainer">Trainer</MenuItem>
                    </Select>
                </FormControl>
                <TextField fullWidth variant="filled" name="q" label="Search by CID or name"
                           defaultValue={trainer || student || ''}/>
                <Box>
                    <Button type="submit" variant="contained">Search</Button>
                </Box>
            </Stack>
        </form>
    );
}