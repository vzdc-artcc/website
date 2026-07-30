'use client';
import ArchivedAlert from "@/components/EventManager/ArchivedAlert";
import EventControls from "@/components/EventManager/EventControls";
import EventPositionsTable from "@/components/EventManager/EventPositionsTable";
import EventPresetSelector from "@/components/EventManager/EventPresetSelector";
import HiddenAlert from "@/components/EventManager/HiddenAlert";
import ManualControllerAddForm from "@/components/EventManager/ManualControllerAddForm";
import {Accordion, AccordionDetails, AccordionSummary, CircularProgress, Paper, Stack, Typography} from "@mui/material";
import {ExpandMore} from "@mui/icons-material";
import OpsPlanForm from "@/components/EventManager/OpsPlanForm";
import TmiForm from "@/components/EventManager/TmiForm";
import OpsPlanFreeTextForm from "@/components/EventManager/OpsPlanFreeTextForm";
import OpsPlanView from "@/components/OpsPlan/OpsPlanView";
import OpsPlanFileForm from "@/components/EventManager/OpsPlanFileForm";
import {useEvent, useEventOpsPlan} from "@/lib/osmium/hooks/events";
import {useMe} from "@/lib/osmium/hooks/me";

export default function EventManagerView({eventId}: { eventId: string }) {

    const {data: me} = useMe();
    const timezone = me?.profile.timezone ?? 'America/New_York';

    const {data: event, isLoading} = useEvent(eventId);
    const {data: opsPlan} = useEventOpsPlan(eventId);

    if (isLoading || !event) {
        return <CircularProgress/>;
    }

    const eventWithOpsPlan = {
        ...event,
        preset_positions: opsPlan?.preset_positions ?? [],
        enable_buffer_times: opsPlan?.enable_buffer_times ?? false,
    };

    return (
        <Stack spacing={2}>
            {event.archived_at && <ArchivedAlert/>}
            {event.hidden && !event.archived_at && <HiddenAlert/>}
            <EventControls event={event}/>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="h6">Preset Positions</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <EventPresetSelector event={event}/>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="h6">OPS Plan</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <OpsPlanForm event={event}/>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="h6">TMIs</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <TmiForm event={event}/>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="h6">OPS Plan Free Text</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <OpsPlanFreeTextForm event={event}/>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="h6">OPS Plan Files</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <OpsPlanFileForm eventId={event.id}/>
                </AccordionDetails>
            </Accordion>
            <ManualControllerAddForm event={eventWithOpsPlan} timezone={timezone}/>
            <EventPositionsTable event={eventWithOpsPlan}/>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="h6">OPS Plan Preview</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Paper elevation={2} sx={{p: 4}}>
                        <OpsPlanView eventId={event.id}/>
                    </Paper>
                </AccordionDetails>
            </Accordion>
        </Stack>
    );
}
