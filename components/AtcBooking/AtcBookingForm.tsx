'use client';
import React, {useState} from 'react';
import Form from "next/form";
import {TextField, Grid2} from "@mui/material";
import {AtcBooking} from "@/lib/atcBooking";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import {User} from "next-auth";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {createOrUpdateAtcBooking} from "@/actions/atc_booking";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function AtcBookingForm({ booking, user }: { booking?: AtcBooking, user: User, }) {

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const [start, setStart] = useState<Dayjs | null>(dayjs.utc(booking?.start || new Date()).tz(user.timezone));
    const [end, setEnd] = useState<Dayjs | null>(dayjs.utc(booking?.end || new Date()).tz(user.timezone));
    const router = useRouter();

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

        const res = await createOrUpdateAtcBooking({
            id: booking?.id,
            callsign: formData.get('position') as string,
            start: start.utc().format('YYYY-MM-DD HH:mm:ss'),
            end: end.utc().format('YYYY-MM-DD HH:mm:ss'),
            cid: Number(user.cid),
        });

        if (typeof res === 'string') {
            toast.error(res);
            return;
        }

        toast.success(`Booking ${booking ? 'updated' : 'created'} successfully!`);
        router.push('/profile/bookings');
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            <Form action={handleSubmit}>
                <Grid2 container columns={2} spacing={2}>
                    <Grid2 size={2}>
                        <TextField fullWidth variant="filled" label="Position/Callsign" name="position" defaultValue={booking?.callsign} required />
                    </Grid2>
                    <Grid2 size={{ xs: 2, sm: 1}}>
                        <DateTimePicker sx={{width: '100%',}}
                                        disablePast
                                        ampm={false}
                                        name="start"
                                        label="Start Time" value={start}
                                        onChange={setStart}/>
                    </Grid2>
                    <Grid2 size={{ xs: 2, sm: 1}}>
                        <DateTimePicker sx={{width: '100%',}}
                                        disablePast
                                        ampm={false}
                                        name="end"
                                        label="End Time" value={end}
                                        onChange={setEnd}/>
                    </Grid2>
                    <Grid2 size={2}>
                        <FormSaveButton />
                    </Grid2>
                </Grid2>
            </Form>
        </LocalizationProvider>
    );

}