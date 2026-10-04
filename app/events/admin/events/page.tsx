import EventTable from "@/components/Event/EventTable";
import EventTableToggleSwitch from "@/components/Event/EventTableToggleSwitch";
import {Add} from "@mui/icons-material";
import {Box, Button, Card, CardContent, Stack, Typography} from "@mui/material";
import Link from "next/link";

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ archived?: string, }> }) {

    const { archived } = await searchParams;

    return (
        <Card>
            <CardContent>
                <Stack direction="row" sx={{
                    justifyContent: "space-between"
                }}>
                    <Box>
                        <Typography variant="h5">Events</Typography>
                        <Typography>Events are archived 24 hours after the published end time.</Typography>
                    </Box>
                    <Link href="/events/admin/events/new">
                        <Button variant="contained" size="large" startIcon={<Add />}>New Event</Button>
                    </Link>
                </Stack>
                <EventTableToggleSwitch archived={archived === 'true'} />
                <EventTable archived={archived === 'true'} />
            </CardContent>
        </Card>
    );
}