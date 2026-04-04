'use client';
import React from 'react';
import {LOA} from "@/generated/prisma/browser";
import {Grid, TextField} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {createOrUpdateLoa} from "@/actions/loa";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function LoaForm({loa}: { loa?: LOA, }) {

    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        const {errors} = await createOrUpdateLoa(formData);
        if (errors) {
            toast(errors.map(e => e.message).join(". "), {type: "error"});
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
                <input type="hidden" name="id" value={loa?.id}/>
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