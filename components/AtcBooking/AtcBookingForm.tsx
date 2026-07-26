'use client';
import React, {useState} from 'react';
import Form from "next/form";
import {Grid, TextField} from "@mui/material";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {AtcBookingItem, useCreateOrUpdateAtcBooking} from "@/lib/osmium/hooks/bookings";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function AtcBookingForm({ booking, cid, timezone: tz }: { booking?: AtcBookingItem, cid: number, timezone: string, }) {

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const [start, setStart] = useState<Dayjs | null>(dayjs.utc(booking?.start || new Date()).tz(tz));
    const [end, setEnd] = useState<Dayjs | null>(dayjs.utc(booking?.end || new Date()).tz(tz));
    const router = useRouter();
    const save = useCreateOrUpdateAtcBooking();

    const handleSubmit = async (formData: FormData) => {
        if (!end || !start) {
            toast.error('Start and End time are required');
            return;
        } else if (end.isBefore(start)) {
            toast.error('End time must be after Start time');
            return;
        } else if (end.diff(start, 'minutes') < 60) {
            toast.error('Booking must be at least 1 hour long');
            return;
        }

        try {
            await save.mutateAsync({
                id: booking?.id,
                callsign: formData.get('position') as string,
                start: start.utc().format('YYYY-MM-DD HH:mm:ss'),
                end: end.utc().format('YYYY-MM-DD HH:mm:ss'),
                cid: Number(cid),
            });
        } catch (e) {
            toast.error((e as Error).message);
            return;
        }

        toast.success(`Booking ${booking ? 'updated' : 'created'} successfully!`);
        router.push('/profile/bookings');
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            <Form action={handleSubmit}>
                <Grid container columns={2} spacing={2}>
                    <Grid size={2}>
                        <TextField fullWidth variant="filled" label="Position/Callsign" name="position" defaultValue={booking?.callsign} required />
                    </Grid>
                    <Grid size={{xs: 2, sm: 1}}>
                        <DateTimePicker
                            sx={{width: '100%'}}
                            disablePast
                            minDateTime={dayjs().tz(tz).add(2, 'hour')}
                            maxDateTime={dayjs().tz(tz).add(72, 'hour').add(1, 'minute')}
                            ampm={false}
                            name="start"
                            label="Start Time"
                            value={start}
                            onChange={setStart}
                        />
                    </Grid>
                    <Grid size={{xs: 2, sm: 1}}>
                        <DateTimePicker
                            sx={{width: '100%'}}
                            disablePast
                            minDateTime={start ? start.add(1, 'hour') : undefined}
                            maxDateTime={start ? start.add(2, 'hour') : dayjs().tz(tz).add(2, 'hour').add(1, 'minute')}
                            ampm={false}
                            name="end"
                            label="End Time"
                            value={end}
                            onChange={setEnd}
                        />
                    </Grid>
                    <Grid size={2}>
                        <FormSaveButton />
                    </Grid>
                </Grid>
            </Form>
        </LocalizationProvider>
    );

}