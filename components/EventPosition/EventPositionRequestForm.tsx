'use client';
import {Autocomplete, Button, Grid2, TextField, Typography} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import {Event, EventPosition, User} from "@prisma/client";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";
import Form from "next/form";
import {useEffect, useState} from "react";
import FormSaveButton from "../Form/FormSaveButton";
import {Add, Delete} from "@mui/icons-material";
import {deleteEventPosition, fetchAllUsers, saveEventPosition} from "@/actions/eventPosition";
import {toast} from "react-toastify";
import {getRating} from "@/lib/vatsim";
import timezone from "dayjs/plugin/timezone";

export default function EventPositionRequestForm({ admin, currentUser, event, eventPosition }: { admin?: boolean, currentUser: User, event: Event, eventPosition?: EventPosition | null, }) {

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [user, setUser] = useState<string>(currentUser.id || '');
    const [position, setPosition] = useState(eventPosition?.requestedPosition || '');
    const [start, setStart] = useState<Dayjs | null>(dayjs.utc(eventPosition?.requestedStartTime || event.start).tz(currentUser.timezone));
    const [end, setEnd] = useState<Dayjs | null>(dayjs.utc(eventPosition?.requestedEndTime || event.end).tz(currentUser.timezone));
    const [notes, setNotes] = useState(eventPosition?.notes || '');

    const handleSubmit = async (formData: FormData) => {

        if (!admin && (eventPosition || event.positionsLocked)) return;

        formData.set('userId', user);
        formData.set('eventId', event.id);
        formData.set('requestedPosition', position);
        formData.set('requestedStartTime', start!.toISOString());
        formData.set('requestedEndTime', end!.toISOString());
        formData.set('notes', notes);

        const { errors } = await saveEventPosition(event, formData, admin);

        if (errors) {
            toast.error(errors.map((error) => error.message).join('.  '));
            return;
        }

        toast.success(`Position ${admin ? 'added' : 'requested'} successfully!`);

    }

    useEffect(() => {

        if(admin) {
            fetchAllUsers().then((users) => setAllUsers(users as User[]));
        }

    }, [admin]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
           <Form action={handleSubmit}>
                <Grid2 container columns={6} spacing={2}>
                    { admin && <Grid2 size={6}>
                    <Autocomplete
                            options={allUsers}
                            getOptionLabel={(option) => `${option.firstName} ${option.lastName} - ${getRating(option.rating)} (${option.cid})`}
                            value={allUsers.find((u) => u.id === user) || null}
                            onChange={(event, newValue) => {
                                setUser(newValue ? newValue.id : '');
                            }}
                            renderInput={(params) => <TextField {...params} label="Controller"/>}
                        />
                    </Grid2> }
                    <Grid2 size={{ xs: 6, md: 2, }}>
                        <Autocomplete
                            disabled={!admin && (!!eventPosition || event.positionsLocked)}
                            freeSolo
                            fullWidth
                            options={event.presetPositions}
                            renderInput={(params) => <TextField {...params} variant="filled" label={admin ? 'FINAL Position' : 'Requested Position'} helperText="Pick from selections OR type your own" />}
                            inputValue={position}
                            onInputChange={(e, value) => setPosition(value)}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 6, sm: 3, md: 2, }}>
                        <DateTimePicker sx={{width: '100%',}}
                                        disabled={!admin && (!!eventPosition || event.positionsLocked)} disablePast
                                        ampm={false} minDateTime={dayjs.utc(event.start).tz(currentUser.timezone)}
                                        maxDateTime={dayjs.utc(event.end).tz(currentUser.timezone)} name="start"
                                        label={admin ? 'FINAL Start' : 'Requested Start'} value={start}
                                        onChange={setStart}/>
                    </Grid2>
                    <Grid2 size={{ xs: 6, sm: 3, md: 2, }}>
                        <DateTimePicker sx={{ width: '100%', }} disabled={!admin && (!!eventPosition || event.positionsLocked)} disablePast ampm={false} minDateTime={dayjs.utc(event.start)} maxDateTime={dayjs.utc(event.end)} name="end" label={admin ? 'FINAL End' : 'Requested End'} value={end} onChange={setEnd} />
                    </Grid2>
                    <Grid2 size={6}>
                        <TextField variant="filled" fullWidth multiline rows={4} disabled={!admin && (!!eventPosition || event.positionsLocked)} name="notes" label={admin ? 'FINAL Notes (optional)' : 'Notes (optional)'} value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </Grid2>
                    <Grid2 size={6}>
                        { admin && <FormSaveButton text="Add" icon={<Add />} /> }
                        { !admin && !eventPosition && !event.positionsLocked && <FormSaveButton text="Request" icon={<Add />} /> }
                        { !admin && eventPosition && !event.positionsLocked && <Button type="button" variant="contained" color="error" startIcon={<Delete />} onClick={() => deleteEventPosition(event, eventPosition.id)}>Delete</Button> }
                        { !admin && event.positionsLocked && <Typography sx={{ mt: 2, }}>Positions are locked for this event.</Typography> }
                        { !admin && <Typography sx={{ mt: 2, }}>You will recieve an email once your final position and time has been published.</Typography> }
                        { admin && <Typography variant="subtitle2" sx={{ mt: 1, }}>The position will be unpublished after being added.</Typography> }
                    </Grid2>
                </Grid2>
            </Form> 
        </LocalizationProvider>
    )
}