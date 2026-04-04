'use client';
import React from 'react';
import {User} from "next-auth";
import {Autocomplete, Grid, TextField} from "@mui/material";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {createIncident} from "@/actions/incident";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function IncidentReportForm({allUsers,}: { allUsers: User[], }) {

    const router = useRouter();
    const [reportee, setReportee] = React.useState<string>('');

    const handleSubmit = async (formData: FormData) => {
        const {errors} = await createIncident(formData);

        if (errors) {
            toast(errors.map((e) => e.message).join('. '), {type: 'error'});
            return;
        }

        router.push('/incident/success');
        toast('Incident report saved!', {type: 'success'});
    }

    return (
        (<LocalizationProvider dateAdapter={AdapterDayjs}>
            <form action={handleSubmit}>
                <input type="hidden" name="reporteeId" value={reportee}/>
                <Grid container columns={2} spacing={2}>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <Autocomplete
                            options={allUsers}
                            getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.cid})`}
                            value={allUsers.find((u) => u.id === reportee) || null}
                            onChange={(event, newValue) => {
                                setReportee(newValue ? newValue.id : '');
                            }}
                            renderInput={(params) => <TextField {...params} label="Controller"/>}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <DateTimePicker  ampm={false} disableFuture name="timestamp"
                                        label="Date and time of incident"/>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <TextField fullWidth variant="filled" name="reporteeCallsign" label="Controller Callsign"/>
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            sm: 1
                        }}>
                        <TextField fullWidth variant="filled" name="reporterCallsign" label="Your Callsign"/>
                    </Grid>
                    <Grid size={2}>
                        <TextField fullWidth multiline rows={5} variant="filled" name="reason"
                                   label="Describe the incident."/>
                    </Grid>
                    <Grid size={2}>
                        <FormSaveButton/>
                    </Grid>
                </Grid>
            </form>
        </LocalizationProvider>)
    );
}