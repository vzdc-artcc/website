import {ButtonGroup, Card, CardContent, Divider, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import {Event} from "@prisma/client";
import ToggleVisibilityButton from "./ToggleVisibilityButton";
import {Article, Edit, Info} from "@mui/icons-material";
import ArchiveToggleButton from "./ArchiveToggleButton";
import {eventGetDuration, formatZuluDate} from "@/lib/date";
import Link from "next/link";
import OpsPlanPublishButton from "@/components/EventManager/OpsPlanPublishButton";

export default async function EventControls({ event }: { event: Event, }) {

    return (
        <Card>
            <CardContent>
                <Typography variant="body2">Event Manager - <b>{event.type}</b> {event.enableBufferTimes ?
                    <span style={{color: 'violet',}}>(BUFFERED)</span> : <></>}</Typography>
                <Typography variant="h4">{event.name}</Typography>
                <Typography>START &nbsp;{formatZuluDate(event.start)} (IN {eventGetDuration(new Date(), event.start, true).toFixed(2)} days)</Typography>
                <Typography>END &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{formatZuluDate(event.end)} (+{eventGetDuration(event.start, event.end).toFixed(2)} hours)</Typography>
                <Divider sx={{ my: 2, }} />
                <ButtonGroup variant="outlined" color="inherit" size="large">
                    <Tooltip title={event.hidden ? 'You must show the event to view information.' : 'Event Information Page'}>
                        <Link href={event.hidden ? '' : `/events/${event.id}`} passHref>
                            <IconButton disabled={event.hidden}>
                                <Info />
                            </IconButton>
                        </Link>
                    </Tooltip>
                    <Tooltip title={
                        event.hidden ? 'You must show the event to view information.'
                            : (!event.opsPlanPublished ? 'You must publish the OPS Plan to view.' : 'OPS Plan Page')
                    }>
                        <Link href={(event.hidden || !event.opsPlanPublished) ? '' : `/events/${event.id}/ops`} passHref>
                            <IconButton disabled={event.hidden || !event.opsPlanPublished}>
                                <Article/>
                            </IconButton>
                        </Link>
                    </Tooltip>
                    <Tooltip title="Edit Event">
                        <Link href={`/events/admin/events/${event.id}`} passHref>
                            <IconButton>
                                <Edit />
                            </IconButton>
                        </Link>
                    </Tooltip>
                </ButtonGroup>
                <Divider sx={{ my: 2, }} />
                <Stack direction="row" spacing={2}>
                    <ToggleVisibilityButton event={event} />
                    <ArchiveToggleButton event={event} />
                    <OpsPlanPublishButton event={event} />
                </Stack>
            </CardContent>
        </Card>
    )
}