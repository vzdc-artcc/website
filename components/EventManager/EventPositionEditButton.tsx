'use client';
import { adminSaveEventPosition, publishEventPosition } from "@/actions/eventPosition";
import { EventPositionWithSolo } from "@/app/events/admin/events/[id]/manager/page";
import { formatZuluDate } from "@/lib/date";
import { Edit } from "@mui/icons-material";
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
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormGroup,
    FormControlLabel,
    Switch,
    Box
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Event } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useState } from "react";
import { toast } from "react-toastify";

export default function EventPositionEditButton({
                                                    event,
                                                    position,
                                                }: {
    event: Event;
    position: EventPositionWithSolo;
}) {

    dayjs.extend(utc);

    const eventStart = dayjs.utc(event.start);
    const eventEnd = dayjs.utc(event.end);

    const reqStart = dayjs.utc(position.requestedStartTime);
    const reqEnd = dayjs.utc(position.requestedEndTime);

    const finalStart = position.finalStartTime ? dayjs.utc(position.finalStartTime) : reqStart;
    const finalEnd = position.finalEndTime ? dayjs.utc(position.finalEndTime) : reqEnd;

    const [open, setOpen] = useState(false);
    const [finalPosition, setFinalPosition] = useState<string>(position.finalPosition || (event.presetPositions.includes(position.requestedPosition) ? position.requestedPosition : ''));
    const [finalStartTime, setFinalStartTime] = useState<dayjs.Dayjs | null>(finalStart);
    const [finalEndTime, setFinalEndTime] = useState<dayjs.Dayjs | null>(finalEnd);
    const [finalNotes, setFinalNotes] = useState<string>(position.finalNotes || '');

    // NEW: controlling category and toggles
    const initialControllingCategory = (position as any)?.controllingCategory || (position as any)?.finalControllingCategory || "LOCAL";
    const [controllingCategory, setControllingCategory] = useState<string>(String(initialControllingCategory).toUpperCase());

    const [isInstructor, setIsInstructor] = useState<boolean>(Boolean((position as any)?.isInstructor));
    const [isSolo, setIsSolo] = useState<boolean>(Boolean((position as any)?.isSolo));
    const [isOts, setIsOts] = useState<boolean>(Boolean((position as any)?.isOts));
    const [isTmu, setIsTmu] = useState<boolean>(Boolean((position as any)?.isTmu));
    const [isCic, setIsCic] = useState<boolean>(Boolean((position as any)?.isCic));

    const minDateAllowed = event.enableBufferTimes ?
        dayjs.utc(event.start).subtract(2, 'hour') :
        dayjs.utc(event.start);

    const maxDateAllowed = event.enableBufferTimes ?
        dayjs.utc(event.end).add(2, 'hour') :
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

        formData.set('controllingCategory', controllingCategory ?? "");
        formData.set('isInstructor', String(Boolean(isInstructor)));
        formData.set('isSolo', String(Boolean(isSolo)));
        formData.set('isOts', String(Boolean(isOts)));
        formData.set('isTmu', String(Boolean(isTmu)));
        formData.set('isCic', String(Boolean(isCic)));

        const { eventPosition, errors } = await adminSaveEventPosition(event, position, formData);

        if (errors) {
            toast.error(errors.map((error) => error.message).join('.  '));
            return;
        }

        toast.success('Position saved successfully!');

        if (publish) {
            const { error } = await publishEventPosition(event, eventPosition);

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

                    <Box sx={{ mb: 2 }}>
                        <FormGroup row>
                            <FormControlLabel control={<Switch checked={isInstructor} onChange={(e) => setIsInstructor(e.target.checked)} />} label="Is Instructor" />
                            <FormControlLabel control={<Switch checked={isSolo} onChange={(e) => setIsSolo(e.target.checked)} />} label="Is Solo" />
                            <FormControlLabel control={<Switch checked={isOts} onChange={(e) => setIsOts(e.target.checked)} />} label="Is OTS" />
                            <FormControlLabel control={<Switch checked={isTmu} onChange={(e) => setIsTmu(e.target.checked)} />} label="Is TMU" />
                            <FormControlLabel control={<Switch checked={isCic} onChange={(e) => setIsCic(e.target.checked)} />} label="Is CIC" />
                        </FormGroup>
                    </Box>

                    <Stack direction="column" spacing={2}>
                        <TextField fullWidth variant="filled" label="Final Position" value={finalPosition} onChange={(e) => setFinalPosition(e.target.value)} />
                        <DateTimePicker sx={{ width: '100%', }} disablePast ampm={false} minDateTime={minDateAllowed}
                                        maxDateTime={maxDateAllowed} name="start" label="Final Start"
                                        value={finalStartTime} onChange={setFinalStartTime} />
                        <DateTimePicker sx={{ width: '100%', }} disablePast ampm={false} minDateTime={minDateAllowed}
                                        maxDateTime={maxDateAllowed} name="end" label="Final End" value={finalEndTime}
                                        onChange={setFinalEndTime} />
                        <TextField fullWidth variant="filled" multiline rows={4} name="finalNotes" label="Final Notes (optional)" value={finalNotes} onChange={(e) => setFinalNotes(e.target.value)} />

                        <FormControl fullWidth>
                            <InputLabel id="controlling-category-label">Controlling Category</InputLabel>
                            <Select
                                labelId="controlling-category-label"
                                value={controllingCategory}
                                label="Controlling Category"
                                onChange={(e) => setControllingCategory(String(e.target.value))}
                                size="small"
                            >
                                <MenuItem value="ADMIN">Admin</MenuItem>
                                <MenuItem value="ENROUTE">Enroute</MenuItem>
                                <MenuItem value="TERMINAL">Terminal</MenuItem>
                                <MenuItem value="LOCAL">Local</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={() => save()} variant="contained" color="primary">Save</Button>
                    <Button onClick={() => save(true)} variant="contained" color="primary" disabled={position.published}>Save & Publish</Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );

}
