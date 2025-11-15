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
    CircularProgress,
    FormControl,
    FormControlLabel,
    Grid2,
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
import {Event, EventType} from "@prisma/client";
import MarkdownEditor from "@uiw/react-markdown-editor";
import dayjs, {Dayjs} from "dayjs";
import utc from "dayjs/plugin/utc";
import Form from "next/form";
import {ReactNode, useEffect, useMemo, useState} from "react";
import FormSaveButton from "../Form/FormSaveButton";
import {upsertEvent, validateEvent} from "@/actions/event";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import Markdown from "react-markdown";
import {ZodErrorSlimResponse} from "@/types";

export default function EventForm({ event }: { event?: Event, }) {
    
    dayjs.extend(utc);

    const theme = useTheme();
    const router = useRouter();

    const [open, setOpen] = useState<number>(0);
    const [bannerUploadType, setBannerUploadType] = useState<'file' | 'url'>('file');

    const [name, setName] = useState<string>(event?.name || '');
    const [host, setHost] = useState<string>(event?.host || '');
    const [start, setStart] = useState<Dayjs | null>(dayjs.utc(event?.start || new Date()));
    const [end, setEnd] = useState<Dayjs | null>(dayjs.utc(event?.end || new Date()));
    const [type, setType] = useState<EventType | undefined>(event?.type);
    const [bannerUrl, setBannerUrl] = useState<string>('');
    const [description, setDescription] = useState<string>(event?.description || '');
    const [featuredFields, setFeaturedFields] = useState<string[]>(event?.featuredFields || []);

    const [status, setStatus] = useState<ReactNode[]>([
        <CircularProgress key={1} color="inherit" size={20} />,
        <CircularProgress key={2} color="inherit" size={20} />,
        <CircularProgress key={3} color="inherit" size={20} />,
        <CircularProgress key={4} color="inherit" size={20} />,
        <CircularProgress key={5} color="inherit" size={20} />,
    ]);

    const debounce = (func: Function, wait: number) => {
        let timeout: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const debouncedUpdateStatus = useMemo(
        () => debounce(async () => {
            const res = await validateEvent({
                id: event?.id,
                name,
                host,
                start: start?.toDate(),
                end: end?.toDate(),
                type: type?.toString() || '',
                description,
                bannerUrl,
                featuredFields,
            }) as ZodErrorSlimResponse;

            const firstStep = await getStepStatus(res, { name, start: start?.toDate(), end: end?.toDate(), });

            if (event?.archived) {
                setStatus([<CheckCircle key={1} color="success" />, <CheckCircle key={2} color="success" />, <CheckCircle key={3} color="success" />, <CheckCircle key={4} color="success" />, <CheckCircle key={5} color="success" />]);
                return;
            }

            const secondStep = await getStepStatus(res, {type: type?.toString() || '', host});
            const thirdStep = await getStepStatus(res, { description });
            const fourthStep = await getStepStatus(res, { bannerUrl });
            const fifthStep = await getStepStatus(res, { featuredFields });
            setStatus([firstStep, secondStep, thirdStep, fourthStep, fifthStep]);
        }, 500),
        [event?.archived, event?.id, name, host, start, end, type, description, bannerUrl, featuredFields]
    );

    const handleSubmit = async (formData: FormData) => {

        formData.set('name', name);
        formData.set('host', host);
        formData.set('start', start?.toISOString() || '');
        formData.set('end', end?.toISOString() || '');
        formData.set('type', type || EventType.HOME);
        formData.set('bannerUrl', bannerUrl);
        formData.set('description', description);
        formData.set('featuredFields', JSON.stringify(featuredFields));

        const {event: newEvent, errors} = await upsertEvent(formData);

        if (errors) {
            toast.error(errors.map((error) => error.message).join('.  '));
            return;
        }

        if (event) {
            toast.success('Event updated successfully.');
        } else {
            toast.success('Event created successfully.');
            router.push(`/events/admin/events/${newEvent.id}/manager`);

            setDescription('');
            setFeaturedFields([]);
            setBannerUploadType('file');
        }
    }

    useEffect(() => {
        if (type === EventType.HOME && host !== 'ZDC') {
            setHost('ZDC');
        }
        debouncedUpdateStatus();
    }, [debouncedUpdateStatus, type]);

    const handleOpen = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setOpen(isExpanded ? panel : -1);
    }

    const back = () => {
        setOpen((prev) => prev - 1);
        debouncedUpdateStatus();
    }

    const forward = () => {
        setOpen((prev) => prev + 1);
        debouncedUpdateStatus();
    }

    const NextButton = 
        <Stack direction="row" justifyContent="end" spacing={1}>
            <Button type="button" color="inherit" onClick={back} disabled={open <= 0}>Back</Button>
            <Button type="button" variant="contained" color="inherit" onClick={forward}>Next</Button>
        </Stack>

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
            <Form action={handleSubmit}>
                <input type="hidden" name="id" value={event?.id || ''} />
                <Box sx={{ my: 2, }}>
                    <Accordion expanded={open === 0} onChange={handleOpen(0)}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Basic Information</Typography>
                                {status[0]}
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid2 container columns={2} spacing={2}>
                                <Grid2 size={2}>
                                    <TextField fullWidth variant="filled" name="name" label="Event Name" value={name} onChange={(e) => setName(e.target.value)} disabled={!!event?.archived} />
                                </Grid2>
                                <Grid2 size={1}>
                                    <DateTimePicker sx={{ width: '100%', }} name="start" label="Start" value={start} disablePast ampm={false} onChange={setStart} />
                                </Grid2>
                                <Grid2 size={1}>
                                    <DateTimePicker sx={{ width: '100%', }} name="end" label="End" value={end} disablePast ampm={false} onChange={setEnd} />
                                </Grid2>
                                <Grid2 size={2}>
                                    <Typography variant="caption" color="text.secondary">All times are in UTC.  Event must be at least 30 minutes long and cannot be before today.</Typography>
                                </Grid2>
                                <Grid2 size={2}>
                                    {NextButton}
                                </Grid2>
                            </Grid2>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={open === 1} onChange={handleOpen(1)}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Event Type</Typography>
                                {status[1]}
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControl fullWidth disabled={!!event?.archived}>
                                <RadioGroup value={type} onChange={(e, v) => setType(v as EventType)}>
                                    {Object.keys(EventType).map((type) => (
                                        <FormControlLabel sx={{ mb: 2, }} key={type} value={type} control={<Radio />} label={(
                                            <>
                                                <Typography variant="subtitle1">{type}</Typography>
                                                <Typography variant="subtitle2">{getDescription(type as EventType)}</Typography>
                                            </>
                                        )} />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <TextField sx={{mb: 1,}} fullWidth variant="filled" name="host" label="Host(s)" value={host}
                                       onChange={(e) => setHost(e.target.value)}
                                       disabled={!!event?.archived || type === 'HOME'}/>
                            {NextButton}                        
                        </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={open === 2} onChange={handleOpen(2)}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Description</Typography>
                                {status[2]}
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            { event?.archived && <Box sx={{ mb: 2, }}><Markdown>{event.description}</Markdown></Box> }
                            { !event?.archived && <Box sx={{ mb: 2, }} data-color-mode={(theme as any).palette.mode}>
                                <MarkdownEditor
                                    enableScroll={false}
                                    minHeight="400px"
                                    value={description}
                                    onChange={(d) => setDescription(d)}
                                />
                            </Box> }
                            {NextButton}
                        </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={open === 3} onChange={handleOpen(3)}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Banner Image or URL</Typography>
                                {!!event?.archived ? <CheckCircle color="success" /> : bannerUploadType === 'url' ? status[3] : <Chip label="UPLOAD" size="small" />}
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            <ToggleButtonGroup
                                    fullWidth
                                    disabled={!!event?.archived}
                                    color="primary"
                                    value={bannerUploadType}
                                    exclusive
                                    sx={{ mb: 1, }}
                                    onChange={(event, value) => setBannerUploadType(value)}
                                >
                                    <ToggleButton value="file">File</ToggleButton>
                                    <ToggleButton value="url">URL</ToggleButton>
                            </ToggleButtonGroup>
                            <Box sx={{ height: 100, mb: 2, }}>
                                {bannerUploadType === "file" ?
                                    <input type="file"            
                                    disabled={!!event?.archived}                     
                                    accept="image/*" 
                                    name="bannerImage" /> :
                                    <TextField variant="filled" fullWidth value={bannerUrl} label="Image URL" onChange={(e) => setBannerUrl(e.target.value)} disabled={!!event?.archived} />}
                            </Box>
                            {NextButton}                        
                        </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={open === 4} onChange={handleOpen(4)}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Featured Fields</Typography>
                                {status[4]}
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Autocomplete
                                sx={{mb: 2,}}
                                disabled={!!event?.archived}
                                multiple
                                options={[]}
                                value={featuredFields}
                                freeSolo
                                renderTags={(value: readonly string[], getTagProps) =>
                                    value.map((option: string, index: number) => {
                                        const {key, ...tagProps} = getTagProps({index});
                                        return (
                                            <Chip variant="filled" label={option} key={key} {...tagProps} />
                                        );
                                    })
                                }
                                onChange={(event, value) => {
                                    setFeaturedFields(value.map((v) => v.toUpperCase()));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        name="featuredFields"
                                        variant="filled"
                                        helperText="Fields that are featured on the event page."
                                        label="Airports (ICAO or IATA)"
                                        placeholder="ICAO or IATA codes only (type and press ENTER after each one)"
                                    />
                                )}
                            />
                            {NextButton}                        
                        </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={open === 5} onChange={handleOpen(5)}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Important Event Information</Typography>
                                {event?.archived ? <CheckCircle color="success" /> : <Info color="info" /> }
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            <ul>
                                <li>
                                    <Typography gutterBottom>By default, when an event is created, it is shown to the
                                        calendar or list view.</Typography>
                                </li>
                                <li>
                                    <Typography gutterBottom>This event will be archived, not deleted, <b>24 hours</b> after the published end date.  This can be reverted through the event manager.</Typography>
                                </li>
                                <li>
                                    <Typography gutterBottom>Create, publish, modify, and delete positions through the Event Manager, which you will be redirected to after submission.</Typography>
                                </li>
                                <li>
                                    <Typography gutterBottom>Editing this event later on will have no impact on the Event Manager, since it only deals with positions.</Typography>
                                </li>
                                <li>
                                    <Typography gutterBottom>You can un-hide this event from the events manager among other common tasks.</Typography>
                                </li>
                                <li>
                                    <Typography gutterBottom fontWeight="bold">You will be notified of any errors in your submission after you submit the form.  All changes will be saved as long as you dont leave this page or refresh.</Typography>
                                </li>
                            </ul>
                            {NextButton}                        
                        </AccordionDetails>
                    </Accordion>
                </Box>
                <FormSaveButton text={event ? 'Update' : 'Create'} />
            </Form>
        </LocalizationProvider>
    );
}

const getDescription = (type: EventType) => {
    switch (type) {
        case EventType.HOME:
            return 'Events that are planned and executed by the ARTCC with a the ARTCC facility being the primary event airport(s). These events have assigned positions based on pre-event signups.';
        case EventType.SUPPORT_REQUIRED:
            return 'Events that the ARTCC is expected to provide supporting staffing for are classed as required support events. These events are coordinated with adjacent facilities and VATUSA. These events have assigned positions based on pre-event signups.';
        case EventType.SUPPORT_OPTIONAL:
            return 'Events that the ARTCC has been requested to support, or that the events team is aware of, that are tracked but not coordinated by the events team. These events may have assigned positions or be staffed first come first serve at the discretion of the Events Coordinator.';
        case EventType.GROUP_FLIGHT:
            return 'Organizations that have requested, or notified the ARTCC, staffing may be posted. Controllers may staff during these requested periods but the ARTCC has made no commitment to making staffing available for the activity.';
        case EventType.FRIDAY_NIGHT_OPERATIONS:
            return 'Any event between 2100z and 0600z on a Friday. FNOs are “owned” by VATUSA but may be delegated to subdivisions for planning, coordination, and execution.';
        case EventType.SATURDAY_NIGHT_OPERATIONS:
            return 'Any event between the hours of 2100z and 0600z on a Saturday. SNOs must receive approval from VATUSA prior to being publicly advertised.';
        case EventType.TRAINING:
            return 'A training event or session involving one or more students.';
        default:
            return '';
    }
}

const getStepStatus = async (parse: ZodErrorSlimResponse, input: { [key: string]: any }) => {

    if (parse.success || parse.errors.length === 0) {
        return <CheckCircle color="success" />;
    }
    
    if (parse.errors.filter((error) => Object.keys(input).includes(error.path)).length > 0) {
        return <Info color="warning" />;
    } else {
        return <CheckCircle color="success" />;
    }
}