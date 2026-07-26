'use client';
import EventForm from "@/components/Event/EventForm";
import ArchivedAlert from "@/components/EventManager/ArchivedAlert";
import ArchiveToggleButton from "@/components/EventManager/ArchiveToggleButton";
import HiddenAlert from "@/components/EventManager/HiddenAlert";
import ToggleVisibilityButton from "@/components/EventManager/ToggleVisibilityButton";
import {OpenInNew} from "@mui/icons-material";
import {Box, Button, Card, CardContent, CircularProgress, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {useParams} from "next/navigation";
import {useEvent} from "@/lib/osmium/hooks/events";

export default function Page() {

    const params = useParams<{ id: string }>();
    const {data: event, isLoading} = useEvent(params.id);

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    if (!event) {
        return <Typography textAlign="center" variant="h5">Event not found.</Typography>;
    }

    return (
        <>
            {event.archived_at && <ArchivedAlert/>}
            {event.hidden && !event.archived_at && <HiddenAlert/>}
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Edit - {event.title}</Typography>
                    <Stack direction="row" spacing={1}>
                        <Link href={`/events/admin/events/${event.id}/manager`} target="_blank">
                            <Button variant="contained" endIcon={<OpenInNew/>}>Manager</Button>
                        </Link>
                        <ToggleVisibilityButton event={event}/>
                        <ArchiveToggleButton event={event}/>
                    </Stack>
                    <EventForm event={event}/>
                </CardContent>
            </Card>
        </>
    );

}
