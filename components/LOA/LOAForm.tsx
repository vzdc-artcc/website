'use client';
import React from 'react';
import {Grid, TextField} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useCreateLoa, useUpdateLoa} from "@/lib/osmium/hooks/loa";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

interface LoaLike {
    id: string;
    start: string;
    end: string;
    reason: string;
}

export default function LoaForm({loa}: { loa?: LoaLike, }) {

    const router = useRouter();
    const createLoa = useCreateLoa();
    const updateLoa = useUpdateLoa();

    const handleSubmit = async (formData: FormData) => {
        const start = new Date(formData.get("start") as string);
        const end = new Date(formData.get("end") as string);
        const reason = formData.get("reason") as string;

        if (!reason?.trim()) {
            toast("Reason is required.", {type: "error"});
            return;
        }
        if (end.getTime() - start.getTime() < 7 * 24 * 60 * 60 * 1000) {
            toast("End date must be at least 7 days after start date.", {type: "error"});
            return;
        }

        const body = {start: start.toISOString(), end: end.toISOString(), reason};

        try {
            if (loa) {
                await updateLoa.mutateAsync({loaId: loa.id, body});
            } else {
                await createLoa.mutateAsync(body);
            }
        } catch {
            toast("Failed to save LOA request.", {type: "error"});
            return;
        }

        if (!loa) {
            router.push("/profile/loa/success");
        }
        toast("LOA request saved.", {type: "success"});
    }

    return (
        (<LocalizationProvider dateAdapter={AdapterDayjs}>
            <form action={handleSubmit}>
                <Grid container columns={2} spacing={2}>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <DatePicker disablePast label="Start" name="start" defaultValue={dayjs(loa?.start)}/>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <DatePicker disablePast label="End" name="end" defaultValue={dayjs(loa?.end)}/>
                    </Grid>
                    <Grid size={2}>
                        <TextField fullWidth variant="filled" multiline rows={4} name="reason" label="Reason for LOA"
                                   defaultValue={loa?.reason || ''}/>
                    </Grid>
                    <Grid size={2}>
                        <FormSaveButton/>
                    </Grid>
                </Grid>
            </form>
        </LocalizationProvider>)
    );

}