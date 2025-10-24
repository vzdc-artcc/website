'use client';
import React, {useState} from 'react';
import {useParams, useRouter} from "next/navigation";
import {Autocomplete, Box, Button, Card, CardContent, MenuItem, Stack, TextField} from "@mui/material";
import {z} from "zod";
import {toast} from "react-toastify";
import {User} from "next-auth";

const months = [
    {
        value: -1,
        label: 'All Months',
    },
    {
        value: 0,
        label: 'January',
    },
    {
        value: 1,
        label: 'February',
    },
    {
        value: 2,
        label: 'March',
    },
    {
        value: 3,
        label: 'April',
    },
    {
        value: 4,
        label: 'May',
    },
    {
        value: 5,
        label: 'June',
    },
    {
        value: 6,
        label: 'July',
    },
    {
        value: 7,
        label: 'August',
    },
    {
        value: 8,
        label: 'September',
    },
    {
        value: 9,
        label: 'October',
    },
    {
        value: 10,
        label: 'November',
    },
    {
        value: 11,
        label: 'December',
    },
]

export default function TrainingStatsTimeSelector({trainingStaff}: { trainingStaff: User[], }) {

    const params = useParams();
    const router = useRouter();

    const month = params.month as string | undefined;
    const year = params.year as string | undefined;
    const cid = params.cid as string | undefined;

    const [controller, setController] = useState(cid);

    const onSubmit = (formData: FormData) => {

        if (!formData.get('year')) {
            toast("Year is required", {type: 'error'})
            return;
        }

        const timeframeZ = z.object({
            month: z.number().min(-2, "Month is invalid").max(11, "Month is invalid"),
            year: z.number({required_error: "Year is required"}).min(2000, "Year must be higher than 2000").max(new Date().getFullYear(), "Year cannot be after this year"),
            cid: z.number().optional()
        });

        const timeframe = timeframeZ.safeParse({
            month: Number(formData.get('month') as string),
            year: Number(formData.get('year') as string),
            cid: Number(controller || undefined) || undefined,
        });

        if (!timeframe.success) {
            toast(timeframe.error.errors.map((e) => e.message).join(".  "), {type: 'error'})
            return;
        }

        router.push(`/training/statistics/${timeframe.data.year}/${timeframe.data.month === -1 ? timeframe.data.cid ? '-' : '' : timeframe.data.month}/${timeframe.data.cid ? timeframe.data.cid : ''}`);
    };

    return (
        <Card>
            <CardContent>
                <form action={onSubmit}>
                    <Stack direction={{xs: 'column', md: 'row',}} spacing={2} justifyContent="center"
                           alignItems="center">
                        <TextField
                            id="month"
                            fullWidth
                            type="number"
                            select
                            label="Month"
                            variant="filled"
                            defaultValue={Number(month) >= 0 ? month : -1}
                            name="month"
                        >
                            {months.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            id="year"
                            fullWidth
                            type="number"
                            label="Year"
                            variant="filled"
                            defaultValue={Number(year) || new Date().getFullYear()}
                            name="year"
                        />
                        <Autocomplete
                            fullWidth
                            options={trainingStaff}
                            getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.cid})`}
                            value={trainingStaff.find((u) => u.cid === controller) || null}
                            onChange={(event, newValue) => {
                                setController(newValue ? newValue.cid : '');
                            }}
                            renderInput={(params) => <TextField {...params} label="Trainer"/>}
                        />
                        <Box>
                            <Button type="submit" variant="contained" size="large">Search</Button>
                        </Box>
                    </Stack>

                </form>
            </CardContent>
        </Card>
    );
}