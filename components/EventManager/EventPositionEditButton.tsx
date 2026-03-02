'use client';
import {adminSaveEventPosition, publishEventPosition} from "@/actions/eventPosition";
import {EventPositionWithSolo} from "@/app/events/admin/events/[id]/manager/page";
import {formatZuluDate} from "@/lib/date";
import {Edit} from "@mui/icons-material";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Stack,
    TextField,
    Tooltip
} from "@mui/material";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {Event} from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {useState} from "react";
import {toast} from "react-toastify";

export default function EventPositionEditButton({ event, position, }: { event: Event, position: EventPositionWithSolo, }) {

    dayjs.extend(utc);

    const eventStart = dayjs.utc(event.start);
    const eventEnd = dayjs.utc(event.end);

    const reqStart = dayjs.utc(position.requestedStartTime);
    const reqEnd = dayjs.utc(position.requestedEndTime);

    const finalStart = position.finalStartTime ? dayjs.utc(position.finalStartTime) : reqStart;
    const finalEnd = position.finalEndTime ? dayjs.utc(position.finalEndTime) : reqEnd;

    const [open, setOpen] = useState(false);
    const [finalPosition, setFinalPosition] = useState(position.finalPosition || (event.presetPositions.includes(position.requestedPosition) ? position.requestedPosition : ''));
    const [finalStartTime, setFinalStartTime] = useState<dayjs.Dayjs | null>(finalStart);
    const [finalEndTime, setFinalEndTime] = useState<dayjs.Dayjs | null>(finalEnd);
    const [finalNotes, setFinalNotes] = useState(position.finalNotes || '');

    const minDateAllowed = event.enableBufferTimes ?
        dayjs.utc(event.start).subtract(1, 'hour') :
        dayjs.utc(event.start);

    const maxDateAllowed = event.enableBufferTimes ?
        dayjs.utc(event.end).add(1, 'hour') :
        dayjs.utc(event.end);

    const handleClick = () => {
        setOpen(true);
    }

    const save = async (publish?: boolean) => {

        const formData = new FormData();
        formData.set('requestedPosition', position.requestedPosition);
        formData.set('finalPosition', finalPosition);
        formData.set('finalStartTime', finalStartTime!.toISOString());
        formData.set('finalEndTime', finalEndTime!.toISOString());
        formData.set('finalNotes', finalNotes);

        const { eventPosition, errors } = await adminSaveEventPosition(event, position, formData);
        
        if (errors) {
            toast.error(errors.map((error) => error.message).join('.  '));
            return;
        }

        toast.success('Position saved successfully!');

        if (publish) {
            const {error} = await publishEventPosition(event, eventPosition);

            if (error) {
                toast.error(error.errors.map((error) => error.message).join('.  '));
                return;
            }

            toast.success('Position published successfully!');
        }

        setOpen(false);
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            <Tooltip title="Edit Position">
                <IconButton onClick={handleClick}>
                    <Edit />
                </IconButton>
            </Tooltip>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Position -  {position.user?.firstName} {position.user?.lastName}</DialogTitle>
                <DialogContent>
                    <DialogContentText>REQUESTED &apos;{position.requestedPosition}&apos;</DialogContentText>
                    <DialogContentText>{eventStart.isSame(reqStart) && eventEnd.isSame(reqEnd) ? 'FULL EVENT' : `${formatZuluDate(position.requestedStartTime)} - ${formatZuluDate(position.requestedEndTime)}`}</DialogContentText>
                    <br />
                    <DialogContentText>Notes:</DialogContentText>
                    <DialogContentText>{position.notes}</DialogContentText>
                    <br />
                    <Stack direction="column" spacing={2}>
                        <TextField fullWidth variant="filled" label="Final Position" value={finalPosition} onChange={(e) => setFinalPosition(e.target.value)} />
                        <DateTimePicker sx={{width: '100%',}} disablePast ampm={false} minDateTime={minDateAllowed}
                                        maxDateTime={maxDateAllowed} name="start" label="Final Start"
                                        value={finalStartTime} onChange={setFinalStartTime}/>
                        <DateTimePicker sx={{width: '100%',}} disablePast ampm={false} minDateTime={minDateAllowed}
                                        maxDateTime={maxDateAllowed} name="end" label="Final End" value={finalEndTime}
                                        onChange={setFinalEndTime}/>
                        <TextField fullWidth variant="filled" multiline rows={4} name="finalNotes" label="Final Notes (optional)" value={finalNotes} onChange={(e) => setFinalNotes(e.target.value)} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={() => save()} variant="contained" color="primary">Save</Button>
                    <Button onClick={() => save(true)} variant="contained" color="primary" disabled={position.published}>Save & Publish</Button>
                </DialogActions>
            </Dialog>
        </ LocalizationProvider>
    );

}