'use client';
import {formatZuluDate} from "@/lib/date";
import {Edit} from "@mui/icons-material";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormGroup,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Tooltip
} from "@mui/material";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {useState} from "react";
import {toast} from "react-toastify";
import {useUpdateEventPosition} from "@/lib/osmium/hooks/events";

interface EventLike {
    id: string;
    preset_positions: string[];
    enable_buffer_times: boolean;
    starts_at: string;
    ends_at: string;
}

interface PositionLike {
    id: string;
    user_name?: string | null;
    requested_position?: string | null;
    requested_start_time?: string | null;
    requested_end_time?: string | null;
    notes?: string | null;
    final_position?: string | null;
    final_start_time?: string | null;
    final_end_time?: string | null;
    final_notes?: string | null;
    controlling_category?: string | null;
    is_instructor: boolean;
    is_solo: boolean;
    is_ots: boolean;
    is_tmu: boolean;
    is_cic: boolean;
    published: boolean;
}

export default function EventPositionEditButton({event, position}: { event: EventLike; position: PositionLike; }) {

    dayjs.extend(utc);

    const updatePosition = useUpdateEventPosition(event.id);

    const eventStart = dayjs.utc(event.starts_at);
    const eventEnd = dayjs.utc(event.ends_at);
    const reqStart = position.requested_start_time ? dayjs.utc(position.requested_start_time) : eventStart;
    const reqEnd = position.requested_end_time ? dayjs.utc(position.requested_end_time) : eventEnd;
    const finalStart = position.final_start_time ? dayjs.utc(position.final_start_time) : reqStart;
    const finalEnd = position.final_end_time ? dayjs.utc(position.final_end_time) : reqEnd;

    const [open, setOpen] = useState(false);
    const [finalPosition, setFinalPosition] = useState<string>(position.final_position || (event.preset_positions.includes(position.requested_position || '') ? position.requested_position! : ''));
    const [finalStartTime, setFinalStartTime] = useState<dayjs.Dayjs | null>(finalStart);
    const [finalEndTime, setFinalEndTime] = useState<dayjs.Dayjs | null>(finalEnd);
    const [finalNotes, setFinalNotes] = useState<string>(position.final_notes || '');
    const [controllingCategory, setControllingCategory] = useState<string>((position.controlling_category || 'LOCAL').toUpperCase());
    const [isInstructor, setIsInstructor] = useState(position.is_instructor);
    const [isSolo, setIsSolo] = useState(position.is_solo);
    const [isOts, setIsOts] = useState(position.is_ots);
    const [isTmu, setIsTmu] = useState(position.is_tmu);
    const [isCic, setIsCic] = useState(position.is_cic);

    const minDateAllowed = event.enable_buffer_times ? eventStart.subtract(2, 'hour') : eventStart;
    const maxDateAllowed = event.enable_buffer_times ? eventEnd.add(2, 'hour') : eventEnd;

    const save = async (publish?: boolean) => {
        try {
            await updatePosition.mutateAsync({
                positionId: position.id,
                body: {
                    final_position: finalPosition,
                    final_start_time: finalStartTime?.toISOString(),
                    final_end_time: finalEndTime?.toISOString(),
                    final_notes: finalNotes,
                    controlling_category: controllingCategory,
                    is_instructor: isInstructor,
                    is_solo: isSolo,
                    is_ots: isOts,
                    is_tmu: isTmu,
                    is_cic: isCic,
                    published: publish ? true : undefined,
                },
            });
            toast.success(publish ? 'Position saved and published successfully!' : 'Position saved successfully!');
            setOpen(false);
        } catch {
            toast.error('Failed to save position.');
        }
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            <Tooltip title="Edit Position">
                <IconButton onClick={() => setOpen(true)}>
                    <Edit/>
                </IconButton>
            </Tooltip>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Position - {position.user_name}</DialogTitle>
                <DialogContent>
                    <DialogContentText>REQUESTED &apos;{position.requested_position}&apos;</DialogContentText>
                    <DialogContentText>{eventStart.isSame(reqStart) && eventEnd.isSame(reqEnd) ? 'FULL EVENT' : `${formatZuluDate(reqStart.toDate())} - ${formatZuluDate(reqEnd.toDate())}`}</DialogContentText>
                    <br/>
                    <DialogContentText>Notes:</DialogContentText>
                    <DialogContentText>{position.notes}</DialogContentText>
                    <br/>

                    <Box sx={{mb: 2}}>
                        <FormGroup row>
                            <FormControlLabel control={<Switch checked={isInstructor} onChange={(e) => setIsInstructor(e.target.checked)}/>} label="Is Instructor"/>
                            <FormControlLabel control={<Switch checked={isSolo} onChange={(e) => setIsSolo(e.target.checked)}/>} label="Is Solo"/>
                            <FormControlLabel control={<Switch checked={isOts} onChange={(e) => setIsOts(e.target.checked)}/>} label="Is OTS"/>
                            <FormControlLabel control={<Switch checked={isTmu} onChange={(e) => setIsTmu(e.target.checked)}/>} label="Is TMU"/>
                            <FormControlLabel control={<Switch checked={isCic} onChange={(e) => setIsCic(e.target.checked)}/>} label="Is CIC"/>
                        </FormGroup>
                    </Box>

                    <Stack direction="column" spacing={2}>
                        <TextField fullWidth variant="filled" label="Final Position" value={finalPosition} onChange={(e) => setFinalPosition(e.target.value)}/>
                        <DateTimePicker sx={{width: '100%',}} disablePast ampm={false} minDateTime={minDateAllowed}
                                        maxDateTime={maxDateAllowed} label="Final Start"
                                        value={finalStartTime} onChange={setFinalStartTime}/>
                        <DateTimePicker sx={{width: '100%',}} disablePast ampm={false} minDateTime={minDateAllowed}
                                        maxDateTime={maxDateAllowed} label="Final End" value={finalEndTime}
                                        onChange={setFinalEndTime}/>
                        <TextField fullWidth variant="filled" multiline rows={4} label="Final Notes (optional)" value={finalNotes} onChange={(e) => setFinalNotes(e.target.value)}/>

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
