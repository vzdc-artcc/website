'use client';
import {ButtonGroup, Card, CardContent, Divider, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import ToggleVisibilityButton from "./ToggleVisibilityButton";
import {Article, Edit, Info} from "@mui/icons-material";
import ArchiveToggleButton from "./ArchiveToggleButton";
import OpsPlanPublishButton from "@/components/EventManager/OpsPlanPublishButton";
import {eventGetDuration, formatZuluDate} from "@/lib/date";
import Link from "next/link";
import {useEventOpsPlan} from "@/lib/osmium/hooks/events";

interface EventLike {
    id: string;
    title: string;
    event_type?: string | null;
    starts_at: string;
    ends_at: string;
    hidden: boolean;
    archived_at?: string | null;
}

export default function EventControls({event}: { event: EventLike }) {

    const {data: opsPlan} = useEventOpsPlan(event.id);

    return (
        <Card>
            <CardContent>
                <Typography variant="body2">Event Manager - <b>{event.event_type}</b> {opsPlan?.enable_buffer_times ?
                    <span style={{color: 'violet',}}>(BUFFERED)</span> : <></>}</Typography>
                <Typography variant="h4">{event.title}</Typography>
                <Typography>START &nbsp;{formatZuluDate(new Date(event.starts_at))} (IN {eventGetDuration(new Date(), new Date(event.starts_at), true).toFixed(2)} days)</Typography>
                <Typography>END &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{formatZuluDate(new Date(event.ends_at))} (+{eventGetDuration(new Date(event.starts_at), new Date(event.ends_at)).toFixed(2)} hours)</Typography>
                <Divider sx={{my: 2,}}/>
                <ButtonGroup variant="outlined" color="inherit" size="large">
                    <Tooltip title={event.hidden ? 'You must show the event to view information.' : 'Event Information Page'}>
                        <Link href={event.hidden ? '' : `/events/${event.id}`} passHref>
                            <IconButton disabled={event.hidden}>
                                <Info/>
                            </IconButton>
                        </Link>
                    </Tooltip>
                    <Tooltip title={
                        event.hidden ? 'You must show the event to view information.'
                            : (!opsPlan?.ops_plan_published ? 'You must publish the OPS Plan to view.' : 'OPS Plan Page')
                    }>
                        <Link href={(event.hidden || !opsPlan?.ops_plan_published) ? '' : `/events/${event.id}/ops`} passHref>
                            <IconButton disabled={event.hidden || !opsPlan?.ops_plan_published}>
                                <Article/>
                            </IconButton>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Edit Event">
                        <Link href={`/events/admin/events/${event.id}`} passHref>
                            <IconButton>
                                <Edit/>
                            </IconButton>
                        </Link>
                    </Tooltip>
                </ButtonGroup>
                <Divider sx={{my: 2,}}/>
                <Stack direction="row" spacing={2}>
                    <ToggleVisibilityButton event={event}/>
                    <ArchiveToggleButton event={event}/>
                    <OpsPlanPublishButton eventId={event.id}/>
                </Stack>
            </CardContent>
        </Card>
    )
}
