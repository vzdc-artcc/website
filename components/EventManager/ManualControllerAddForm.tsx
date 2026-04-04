import {Accordion, AccordionDetails, AccordionSummary, Typography} from "@mui/material";
import {Event, User} from "@/generated/prisma/browser";
import EventPositionRequestForm from "../EventPosition/EventPositionRequestForm";
import {ExpandMore} from "@mui/icons-material";

export default function ManualControllerAddForm({ event, user }: { event: Event, user: User}) {

    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" gutterBottom>Manually Assign Controller</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <EventPositionRequestForm event={event} admin currentUser={user} />
            </AccordionDetails>
        </Accordion>
    )
}