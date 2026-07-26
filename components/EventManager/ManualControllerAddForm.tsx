import {Accordion, AccordionDetails, AccordionSummary, Typography} from "@mui/material";
import EventPositionRequestForm from "../EventPosition/EventPositionRequestForm";
import {ExpandMore} from "@mui/icons-material";

interface EventLike {
    id: string;
    preset_positions: string[];
    enable_buffer_times: boolean;
    starts_at: string;
    ends_at: string;
    positions_locked: boolean;
}

export default function ManualControllerAddForm({event, timezone}: { event: EventLike, timezone: string }) {

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMore/>}>
                <Typography variant="h6" gutterBottom>Manually Assign Controller</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <EventPositionRequestForm event={event} admin currentUserTimezone={timezone}/>
            </AccordionDetails>
        </Accordion>
    )
}
