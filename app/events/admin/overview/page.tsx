'use client';
import Link from "next/link";
import {
    Card,
    CardContent,
    CircularProgress,
    Grid,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import {Article, Checklist, Edit, Info} from "@mui/icons-material";
import {eventGetDuration} from "@/lib/date";
import {useEventOpsPlan, useEvents} from "@/lib/osmium/hooks/events";
import RecentAuditActivity from "@/components/Logs/RecentAuditActivity";

function NextEventLinks({eventId, hidden}: { eventId: string, hidden: boolean }) {
    const {data: opsPlan} = useEventOpsPlan(eventId);
    return (
        <>
            <Tooltip title={hidden ? 'You must show the event to view information.' : 'Event Information Page'}>
                <span>
                    <Link href={hidden ? '' : `/events/${eventId}`} style={{color: 'inherit', textDecoration: 'none'}}>
                        <IconButton disabled={hidden}>
                            <Info/>
                        </IconButton>
                    </Link>
                </span>
            </Tooltip>
            <Tooltip title={
                hidden ? 'You must show the event to view information.'
                    : (!opsPlan?.ops_plan_published ? 'You must publish the OPS Plan to view.' : 'OPS Plan Page')
            }>
                <span>
                    <Link href={(hidden || !opsPlan?.ops_plan_published) ? '' : `/events/${eventId}/ops`}
                          style={{color: 'inherit', textDecoration: 'none'}}>
                        <IconButton disabled={hidden || !opsPlan?.ops_plan_published}>
                            <Article/>
                        </IconButton>
                    </Link>
                </span>
            </Tooltip>
            <Link href={`/events/admin/events/${eventId}/manager`} style={{color: 'inherit', textDecoration: 'none'}}>
                <IconButton>
                    <Checklist/>
                </IconButton>
            </Link>
            <Link href={`/events/admin/events/${eventId}`} style={{color: 'inherit', textDecoration: 'none'}}>
                <IconButton>
                    <Edit/>
                </IconButton>
            </Link>
        </>
    );
}

export default function Page() {
    const {data: eventsData, isLoading: eventsLoading} = useEvents({pageSize: 200});

    if (eventsLoading) {
        return <CircularProgress/>;
    }

    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingEvents = (eventsData?.items ?? [])
        .filter((e) => !e.archived_at && new Date(e.starts_at) >= now && new Date(e.starts_at) <= in30Days)
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

    return (
        <Grid container columns={2} spacing={2}>
            <Grid size={{xs: 2, md: 1}}>
                <Card sx={{height: '100%'}}>
                    <CardContent>
                        <Typography>Upcoming Unarchived Events (30 days)</Typography>
                        <Typography variant="h4">{upcomingEvents.length}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 2, md: 1}}>
                <Card sx={{height: '100%'}}>
                    <CardContent>
                        <Typography>Next Event</Typography>
                        {upcomingEvents[0] &&
                            <>
                                <Stack direction="row" alignItems="center">
                                    <Typography variant="h4" sx={{mr: 1}}>{upcomingEvents[0].title || 'N/A'}</Typography>
                                    <NextEventLinks eventId={upcomingEvents[0].id} hidden={upcomingEvents[0].hidden}/>
                                </Stack>
                                <Typography>In {eventGetDuration(new Date(), new Date(upcomingEvents[0].starts_at), true).toFixed(0)} days</Typography>
                            </>}
                        {!upcomingEvents[0] && <Typography variant="h4">N/A</Typography>}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={2}>
                <RecentAuditActivity domain="events" title="Recent Events Activity" href="/events/admin/logs"/>
            </Grid>
        </Grid>
    )
}
