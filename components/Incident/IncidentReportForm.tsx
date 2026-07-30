'use client';
import React from 'react';
import {Autocomplete, Grid, TextField} from "@mui/material";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import dayjs, {Dayjs} from "dayjs";
import {useRosterControllers} from "@/lib/osmium/hooks/users";
import {useCreateIncident} from "@/lib/osmium/hooks/incidents";

export default function IncidentReportForm() {

    const router = useRouter();
    const {data: controllersData} = useRosterControllers();
    const createIncident = useCreateIncident();
    const [reporteeCid, setReporteeCid] = React.useState<number | null>(null);
    const [timestamp, setTimestamp] = React.useState<Dayjs | null>(null);

    const controllers = (controllersData?.items ?? [])
        .sort((a, b) => a.basic.name.localeCompare(b.basic.name));

    const handleSubmit = async (formData: FormData) => {
        if (!reporteeCid) {
            toast('Please select a controller.', {type: 'error'});
            return;
        }
        if (!timestamp || timestamp.isAfter(dayjs())) {
            toast('Please select a valid date and time in the past.', {type: 'error'});
            return;
        }

        const reporteeCallsign = (formData.get('reporteeCallsign') as string || '').trim();
        const reporterCallsign = (formData.get('reporterCallsign') as string || '').trim();
        const reason = (formData.get('reason') as string || '').trim();

        if (!reporteeCallsign || !reason) {
            toast('Please fill out all required fields.', {type: 'error'});
            return;
        }

        try {
            await createIncident.mutateAsync({
                reportee_cid: reporteeCid,
                timestamp: timestamp.toISOString(),
                reason,
                reporter_callsign: reporterCallsign || null,
                reportee_callsign: reporteeCallsign,
            });
        } catch {
            toast('Failed to submit incident report.', {type: 'error'});
            return;
        }

        router.push('/incident/success');
        toast('Incident report saved!', {type: 'success'});
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
                        <Autocomplete
                            options={controllers}
                            getOptionLabel={(option) => `${option.basic.name} (${option.basic.cid})`}
                            value={controllers.find((c) => c.basic.cid === reporteeCid) || null}
                            onChange={(event, newValue) => {
                                setReporteeCid(newValue ? newValue.basic.cid : null);
                            }}
                            renderInput={(params) => <TextField {...params} label="Controller"/>}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 2,
                            md: 1
                        }}>
                        <DateTimePicker ampm={false} disableFuture label="Date and time of incident"
                                        value={timestamp}
                                        onChange={(newValue) => setTimestamp(newValue)}/>
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
