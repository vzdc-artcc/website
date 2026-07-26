'use client';
import {Autocomplete, Button, Grid, TextField, Typography} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {useState} from "react";
import FormSaveButton from "../Form/FormSaveButton";
import {Add, Delete} from "@mui/icons-material";
import {toast} from "react-toastify";
import {useCreateEventPosition, useDeleteEventPosition} from "@/lib/osmium/hooks/events";
import {useRosterControllers} from "@/lib/osmium/hooks/users";

interface EventLike {
    id: string;
    preset_positions: string[];
    enable_buffer_times: boolean;
    starts_at: string;
    ends_at: string;
    positions_locked: boolean;
}

interface EventPositionLike {
    id: string;
    requested_position?: string | null;
    requested_secondary_position: string;
    requested_start_time?: string | null;
    requested_end_time?: string | null;
    notes?: string | null;
}

export default function EventPositionRequestForm({admin, currentUserTimezone, event, eventPosition}: {
    admin?: boolean,
    currentUserTimezone: string,
    event: EventLike,
    eventPosition?: EventPositionLike | null,
}) {

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const createPosition = useCreateEventPosition(event.id);
    const deletePosition = useDeleteEventPosition(event.id);
    const {data: controllersData} = useRosterControllers();
    const controllers = admin ? (controllersData?.items ?? []) : [];

    const minDateAllowed = event.enable_buffer_times ?
        dayjs.utc(event.starts_at).subtract(2, 'hour').tz(currentUserTimezone) :
        dayjs.utc(event.starts_at).tz(currentUserTimezone);

    const maxDateAllowed = event.enable_buffer_times ?
        dayjs.utc(event.ends_at).add(2, 'hour').tz(currentUserTimezone) :
        dayjs.utc(event.ends_at).tz(currentUserTimezone);

    const defaultStart = eventPosition?.requested_start_time
        ? dayjs.utc(eventPosition.requested_start_time).tz(currentUserTimezone)
        : dayjs.utc(event.starts_at).tz(currentUserTimezone);

    const defaultEnd = eventPosition?.requested_end_time
        ? dayjs.utc(eventPosition.requested_end_time).tz(currentUserTimezone)
        : dayjs.utc(event.ends_at).tz(currentUserTimezone);

    const [userId, setUserId] = useState<string | null>(null);
    const [position, setPosition] = useState(eventPosition?.requested_position || '');
    const [secondaryPosition, setSecondaryPosition] = useState(eventPosition?.requested_secondary_position || '');
    const [start, setStart] = useState<Dayjs | null>(defaultStart);
    const [end, setEnd] = useState<Dayjs | null>(defaultEnd);
    const [notes, setNotes] = useState(eventPosition?.notes || '');

    const disabled = !admin && (!!eventPosition || event.positions_locked);

    const handleSubmit = async () => {
        if (disabled) return;
        if (admin && !userId) {
            toast.error('Please select a controller.');
            return;
        }
        if (!start || !end) {
            toast.error('Please select a start and end time.');
            return;
        }

        try {
            await createPosition.mutateAsync({
                requested_position: position,
                requested_secondary_position: secondaryPosition || undefined,
                requested_start_time: start.toISOString(),
                requested_end_time: end.toISOString(),
                notes: notes || undefined,
                user_id: admin ? userId : undefined,
                final_position: admin ? position : undefined,
                final_start_time: admin ? start.toISOString() : undefined,
                final_end_time: admin ? end.toISOString() : undefined,
                final_notes: admin ? (notes || undefined) : undefined,
            });
        } catch {
            toast.error('Failed to save position.');
            return;
        }

        toast.success(`Position ${admin ? 'added' : 'requested'} successfully!`);
    }

    const handleDelete = async () => {
        if (!eventPosition) return;
        try {
            await deletePosition.mutateAsync(eventPosition.id);
            toast.success('Position request deleted.');
        } catch {
            toast.error('Failed to delete position request.');
        }
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            <form action={handleSubmit}>
                <Grid container columns={6} spacing={2}>
                    {admin && <Grid size={6}>
                        <Autocomplete
                            options={controllers}
                            getOptionLabel={(option) => `${option.basic.name}${option.basic.rating ? ` - ${option.basic.rating}` : ''} (${option.basic.cid})`}
                            onChange={(e, newValue) => setUserId(newValue?.full?.id ?? null)}
                            renderInput={(params) => <TextField {...params} label="Controller"/>}
                        />
                    </Grid>}
                    <Grid size={{xs: 6, sm: 3,}}>
                        <Autocomplete
                            disabled={disabled}
                            freeSolo
                            fullWidth
                            options={event.preset_positions}
                            renderInput={(params) => <TextField {...params} variant="filled" label={admin ? 'FINAL Position' : 'Requested Position'} helperText="Pick from selections OR type your own"/>}
                            inputValue={position}
                            onInputChange={(e, value) => setPosition(value)}
                        />
                    </Grid>
                    <Grid size={{xs: 6, sm: 3,}}>
                        <Autocomplete
                            disabled={disabled}
                            fullWidth
                            options={["Delivery", "Ground", "Tower", "Approach", "Center"]}
                            renderInput={(params) => <TextField {...params} variant="filled"
                                                                label={admin ? 'Secondary Position' : 'Requested Secondary Position'}
                                                                helperText="You must pick from the selections."/>}
                            inputValue={secondaryPosition}
                            onInputChange={(e, value) => setSecondaryPosition(value)}
                        />
                    </Grid>
                    <Grid size={{xs: 6, sm: 3,}}>
                        <DateTimePicker sx={{width: '100%',}}
                                        disabled={disabled} disablePast
                                        ampm={false} minDateTime={minDateAllowed}
                                        maxDateTime={maxDateAllowed} name="start"
                                        label={admin ? 'FINAL Start' : 'Requested Start'} value={start}
                                        onChange={setStart}/>
                    </Grid>
                    <Grid size={{xs: 6, sm: 3,}}>
                        <DateTimePicker sx={{width: '100%',}}
                                        disabled={disabled} disablePast
                                        ampm={false} minDateTime={minDateAllowed} maxDateTime={maxDateAllowed}
                                        name="end" label={admin ? 'FINAL End' : 'Requested End'} value={end}
                                        onChange={setEnd}/>
                    </Grid>
                    <Grid size={6}>
                        <TextField variant="filled" fullWidth multiline rows={4}
                                   disabled={disabled} name="notes"
                                   label={admin ? 'FINAL Notes (optional)' : 'Notes (optional)'} value={notes}
                                   onChange={(e) => setNotes(e.target.value)}
                                   helperText="Mention anything that you would like the event staff to know, but be concise."/>
                    </Grid>
                    <Grid size={6}>
                        {admin && <FormSaveButton text="Add" icon={<Add/>}/>}
                        {!admin && !eventPosition && !event.positions_locked && <FormSaveButton text="Request" icon={<Add/>}/>}
                        {!admin && eventPosition && !event.positions_locked &&
                            <Button type="button" variant="contained" color="error" startIcon={<Delete/>} onClick={handleDelete}>Delete</Button>}
                        {!admin && event.positions_locked && <Typography sx={{mt: 2,}}>Positions are locked for this event.</Typography>}
                        {!admin && <Typography sx={{mt: 2,}}>You will receive an email once your final position and time has been published.</Typography>}
                        {admin && <Typography variant="subtitle2" sx={{mt: 1,}}>The position will be unpublished after being added.</Typography>}
                    </Grid>
                </Grid>
            </form>
        </LocalizationProvider>
    )
}
