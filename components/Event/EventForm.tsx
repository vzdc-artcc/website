'use client';

import {useTheme} from "@emotion/react";
import {CheckCircle, ExpandMore, Info} from "@mui/icons-material";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Box,
    Button,
    Chip,
    FormControl,
    FormControlLabel,
    Grid,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import MarkdownEditor from "@uiw/react-markdown-editor";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";
import {useEffect, useMemo, useState} from "react";
import FormSaveButton from "../Form/FormSaveButton";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import Markdown from "react-markdown";
import {useCreateEvent, useUpdateEvent} from "@/lib/osmium/hooks/events";
import {useImportFileFromUrl, useUploadFile} from "@/lib/osmium/hooks/files";

const EVENT_TYPES = [
    'HOME', 'SUPPORT_REQUIRED', 'SUPPORT_OPTIONAL', 'GROUP_FLIGHT',
    'FRIDAY_NIGHT_OPERATIONS', 'SATURDAY_NIGHT_OPERATIONS', 'TRAINING',
] as const;

const MAX_FILE_SIZE = 1024 * 1024 * 4;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const getEventTypeDescription = (type: string) => {
    switch (type) {
        case 'HOME':
            return 'Events that are planned and executed by the ARTCC with a the ARTCC facility being the primary event airport(s). These events have assigned positions based on pre-event signups.';
        case 'SUPPORT_REQUIRED':
            return 'Events that the ARTCC is expected to provide supporting staffing for are classed as required support events. These events are coordinated with adjacent facilities and VATUSA. These events have assigned positions based on pre-event signups.';
        case 'SUPPORT_OPTIONAL':
            return 'Events that the ARTCC has been requested to support, or that the events team is aware of, that are tracked but not coordinated by the events team. These events may have assigned positions or be staffed first come first serve at the discretion of the Events Coordinator.';
        case 'GROUP_FLIGHT':
            return 'Organizations that have requested, or notified the ARTCC, staffing may be posted. Controllers may staff during these requested periods but the ARTCC has made no commitment to making staffing available for the activity.';
        case 'FRIDAY_NIGHT_OPERATIONS':
            return 'Any event between 2100z and 0600z on a Friday. FNOs are "owned" by VATUSA but may be delegated to subdivisions for planning, coordination, and execution.';
        case 'SATURDAY_NIGHT_OPERATIONS':
            return 'Any event between the hours of 2100z and 0600z on a Saturday. SNOs must receive approval from VATUSA prior to being publicly advertised.';
        case 'TRAINING':
            return 'A training event or session involving one or more students.';
        default:
            return '';
    }
}

const isValidHttpUrl = (value: string) => {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

interface EventLike {
    id: string;
    title: string;
    host?: string | null;
    event_type?: string | null;
    description?: string | null;
    starts_at: string;
    ends_at: string;
    archived_at?: string | null;
    banner_asset_id?: string | null;
}

function StepStatus({valid}: { valid: boolean }) {
    return valid ? <CheckCircle color="success" fontSize="small"/> : <Info color="warning" fontSize="small"/>;
}

export default function EventForm({event}: { event?: EventLike }) {

    dayjs.extend(utc);

    const theme = useTheme();
    const router = useRouter();
    const createEvent = useCreateEvent();
    const updateEvent = useUpdateEvent();
    const uploadFile = useUploadFile();
    const importFromUrl = useImportFileFromUrl();

    const isArchived = !!event?.archived_at;

    const [open, setOpen] = useState<number>(0);
    const [title, setTitle] = useState<string>(event?.title || '');
    const [hosts, setHosts] = useState<string[]>(
        event?.host ? event.host.split(',').map((h) => h.trim()).filter(Boolean) : []
    );
    const [start, setStart] = useState<Dayjs | null>(dayjs.utc(event?.starts_at || new Date()));
    const [end, setEnd] = useState<Dayjs | null>(dayjs.utc(event?.ends_at || new Date()));
    const [eventType, setEventType] = useState<string>(event?.event_type || 'HOME');
    const [description, setDescription] = useState<string>(event?.description || '');
    const [bannerUploadType, setBannerUploadType] = useState<'file' | 'url'>('file');
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerUrl, setBannerUrl] = useState<string>('');

    useEffect(() => {
        if (eventType === 'HOME') {
            setHosts(['ZDC']);
        }
    }, [eventType]);

    const stepValid = useMemo(() => {
        if (isArchived) {
            return [true, true, true, true];
        }

        const basicInfoValid = title.trim().length >= 3 && title.trim().length <= 255
            && !!start && !!end
            && start.isAfter(dayjs().startOf('day'))
            && end.diff(start, 'minute') > 30;

        const eventTypeValid = !!eventType && hosts.length > 0 && hosts.every((h) => h.length <= 100);

        const descriptionValid = description.trim().length >= 10;

        const bannerValid = !!event || (
            bannerUploadType === 'file'
                ? (!!bannerFile && ALLOWED_FILE_TYPES.includes(bannerFile.type) && bannerFile.size <= MAX_FILE_SIZE)
                : isValidHttpUrl(bannerUrl.trim())
        );

        return [basicInfoValid, eventTypeValid, descriptionValid, bannerValid];
    }, [isArchived, title, start, end, eventType, hosts, description, event, bannerUploadType, bannerFile, bannerUrl]);

    const handleSubmit = async () => {
        const stepNames = ['Basic Information', 'Event Type', 'Description', 'Banner Image or URL'];
        const firstInvalid = stepValid.findIndex((valid) => !valid);
        if (firstInvalid !== -1) {
            toast.error(`Please correct the "${stepNames[firstInvalid]}" step before saving.`);
            setOpen(firstInvalid);
            return;
        }

        try {
            let bannerAssetId: string | undefined;
            if (bannerUploadType === 'file' && bannerFile) {
                const uploaded = await uploadFile.mutateAsync({file: bannerFile, public: true});
                bannerAssetId = uploaded.id;
            } else if (bannerUploadType === 'url' && bannerUrl.trim()) {
                const imported = await importFromUrl.mutateAsync({url: bannerUrl.trim(), public: true});
                bannerAssetId = imported?.id;
            }

            const host = hosts.join(', ');

            if (event) {
                await updateEvent.mutateAsync({
                    eventId: event.id,
                    body: {
                        title,
                        host,
                        event_type: eventType,
                        description,
                        starts_at: start!.toISOString(),
                        ends_at: end!.toISOString(),
                        ...(bannerAssetId ? {banner_asset_id: bannerAssetId} : {}),
                    },
                });
                toast.success('Event updated successfully.');
            } else {
                const newEvent = await createEvent.mutateAsync({
                    title,
                    host,
                    event_type: eventType,
                    description,
                    starts_at: start!.toISOString(),
                    ends_at: end!.toISOString(),
                    banner_asset_id: bannerAssetId,
                });
                toast.success('Event created successfully.');
                router.push(`/events/admin/events/${newEvent!.id}/manager`);
            }
        } catch {
            toast.error(bannerUploadType === 'url' && !event
                ? 'Failed to save event. If you provided a banner URL, make sure it is a direct link to a publicly accessible image.'
                : 'Failed to save event.');
        }
    }

    const handleOpen = (panel: number) => (_e: React.SyntheticEvent, isExpanded: boolean) => {
        setOpen(isExpanded ? panel : -1);
    }

    const back = () => setOpen((prev) => prev - 1);
    const forward = () => setOpen((prev) => prev + 1);

    const NextButton =
        <Stack direction="row" justifyContent="end" spacing={1}>
            <Button type="button" color="inherit" onClick={back} disabled={open <= 0}>Back</Button>
            <Button type="button" variant="contained" color="inherit" onClick={forward}>Next</Button>
        </Stack>

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            <form action={handleSubmit}>
                <Box sx={{my: 2,}}>
                    <Accordion expanded={open === 0} onChange={handleOpen(0)}>
                        <AccordionSummary expandIcon={<ExpandMore/>}>
                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{width: '100%', pr: 1,}}>
                                <Typography variant="h6">Basic Information</Typography>
                                <StepStatus valid={stepValid[0]}/>
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container columns={2} spacing={2}>
                                <Grid size={2}>
                                    <TextField fullWidth variant="filled" label="Event Name" value={title}
                                               onChange={(e) => setTitle(e.target.value)} disabled={isArchived}/>
                                </Grid>
                                <Grid size={1}>
                                    <DateTimePicker sx={{width: '100%',}} label="Start" value={start} disablePast
                                                    ampm={false} onChange={setStart} disabled={isArchived}/>
                                </Grid>
                                <Grid size={1}>
                                    <DateTimePicker sx={{width: '100%',}} label="End" value={end} disablePast
                                                    ampm={false} onChange={setEnd} disabled={isArchived}/>
                                </Grid>
                                <Grid size={2}>
                                    <Typography variant="caption" color="text.secondary">All times are in UTC.
                                        Event must be at least 30 minutes long and cannot be before today.</Typography>
                                </Grid>
                                <Grid size={2}>
                                    {NextButton}
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={open === 1} onChange={handleOpen(1)}>
                        <AccordionSummary expandIcon={<ExpandMore/>}>
                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{width: '100%', pr: 1,}}>
                                <Typography variant="h6">Event Type</Typography>
                                <StepStatus valid={stepValid[1]}/>
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControl fullWidth disabled={isArchived}>
                                <RadioGroup value={eventType} onChange={(e, v) => setEventType(v)}>
                                    {EVENT_TYPES.map((type) => (
                                        <FormControlLabel sx={{mb: 2,}} key={type} value={type} control={<Radio/>}
                                                           label={(
                                                               <>
                                                                   <Typography variant="subtitle1">{type}</Typography>
                                                                   <Typography variant="subtitle2">{getEventTypeDescription(type)}</Typography>
                                                               </>
                                                           )}/>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <Autocomplete
                                sx={{mb: 1,}}
                                disabled={isArchived || eventType === 'HOME'}
                                multiple
                                options={[]}
                                value={hosts}
                                freeSolo
                                renderTags={(value: readonly string[], getTagProps) =>
                                    value.map((option: string, index: number) => {
                                        const {key, ...tagProps} = getTagProps({index});
                                        return (
                                            <Chip variant="filled" label={option} key={key} {...tagProps} />
                                        );
                                    })
                                }
                                onChange={(_e, value) => {
                                    setHosts(value.map((v) => v.trim().toUpperCase()).filter(Boolean));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="filled"
                                        label="Host(s)"
                                        helperText="Type each hosting ARTCC/organization and press ENTER to add it. Add as many as needed."
                                        placeholder="Type and press ENTER after each one"
                                    />
                                )}
                            />
                            {NextButton}
                        </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={open === 2} onChange={handleOpen(2)}>
                        <AccordionSummary expandIcon={<ExpandMore/>}>
                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{width: '100%', pr: 1,}}>
                                <Typography variant="h6">Description</Typography>
                                <StepStatus valid={stepValid[2]}/>
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            {isArchived && <Box sx={{mb: 2,}}><Markdown>{description}</Markdown></Box>}
                            {!isArchived && <Box sx={{mb: 2,}} data-color-mode={(theme as any).palette.mode}>
                                <MarkdownEditor
                                    enableScroll={false}
                                    minHeight="400px"
                                    value={description}
                                    onChange={(d) => setDescription(d)}
                                />
                            </Box>}
                            {NextButton}
                        </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={open === 3} onChange={handleOpen(3)}>
                        <AccordionSummary expandIcon={<ExpandMore/>}>
                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{width: '100%', pr: 1,}}>
                                <Typography variant="h6">Banner Image or URL</Typography>
                                <StepStatus valid={stepValid[3]}/>
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            <ToggleButtonGroup
                                fullWidth
                                disabled={isArchived}
                                color="primary"
                                value={bannerUploadType}
                                exclusive
                                sx={{mb: 1,}}
                                onChange={(_e, value) => value && setBannerUploadType(value)}
                            >
                                <ToggleButton value="file">File</ToggleButton>
                                <ToggleButton value="url">URL</ToggleButton>
                            </ToggleButtonGroup>
                            <Box sx={{mb: 2,}}>
                                {bannerUploadType === 'file' ?
                                    <input type="file" disabled={isArchived} accept="image/*"
                                           onChange={(e) => setBannerFile(e.target.files?.[0] || null)}/> :
                                    <TextField variant="filled" fullWidth value={bannerUrl} label="Image URL"
                                               placeholder="https://example.com/banner.png"
                                               helperText="The image will be downloaded and stored like any other uploaded banner."
                                               onChange={(e) => setBannerUrl(e.target.value)} disabled={isArchived}/>}
                            </Box>
                            {NextButton}
                        </AccordionDetails>
                    </Accordion>
                </Box>
                <FormSaveButton text={event ? 'Update' : 'Create'}/>
            </form>
        </LocalizationProvider>
    );
}
