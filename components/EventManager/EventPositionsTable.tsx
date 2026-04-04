import {EventPositionWithSolo} from "@/app/events/admin/events/[id]/manager/page";
import {
    Box,
    ButtonGroup,
    Card,
    CardContent,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import {formatZuluDate} from "@/lib/date";
import {Event, EventPosition} from "@/generated/prisma/browser";
import TogglePositionsLockButton from "./TogglePositionsLockButton";
import ForcePositionsToggleSwitch from "./ForcePositionsToggleSwitch";
import EventPositionDeleteButton from "./EventPositionDeleteButton";
import EventPositionEditButton from "./EventPositionEditButton";
import EventPositionPublishButton from "./EventPositionPublishButton";
import EventPositionPublishAllButton from "./EventPositionPublishAllButton";
import SendDiscordEventDataButton from "@/components/EventManager/SendDiscordEventDataButton";
import EventPositionCsvButton from "@/components/EventManager/EventPositionCsvButton";
import {fetchCertificationsForUsers, fetchLastControlledEventsForUsers} from "@/actions/eventPosition";
import ControllerChip from "@/components/EventManager/ControllerChip";

export default async function EventPositionsTable({ event, positions }: { event: Event, positions: EventPositionWithSolo[] }) {
    const userIds = Array.from(
        new Set(
            positions
                .map(p => p.user?.id)
                .filter((id): id is string => typeof id === 'string' && id.length > 0)
        )
    );

    const certificationsByUser: Record<string, any[]> = await fetchCertificationsForUsers(userIds);
    const lastControlledByUser = await fetchLastControlledEventsForUsers(userIds);



    const getTimeRectangle = (position: EventPosition, eventStart: Date, start: Date, eventEnd: Date, end: Date) => {

        const bufferMs = 60 * 60 * 1000 * 2;
        const totalStart = event.enableBufferTimes ? new Date(eventStart.getTime() - bufferMs) : eventStart;
        const totalEnd = event.enableBufferTimes ? new Date(eventEnd.getTime() + bufferMs) : eventEnd;

        if (totalStart.getTime() > start.getTime() || totalEnd.getTime() < end.getTime()) {
            return <>
                <div style={{ position: 'relative', height: '20px', backgroundColor: 'red', width: '80px' }} />
                <Typography variant="caption">INVALID (hover)</Typography>
            </>;
        }

        const totalDuration = totalEnd.getTime() - totalStart.getTime();

        const startPct = ((start.getTime() - totalStart.getTime()) / totalDuration) * 100;
        const endPct = ((end.getTime() - totalStart.getTime()) / totalDuration) * 100;

        const coreStartPct = ((eventStart.getTime() - totalStart.getTime()) / totalDuration) * 100;
        const coreEndPct = ((eventEnd.getTime() - totalStart.getTime()) / totalDuration) * 100;

        const preBufferUsedStart = startPct;
        const preBufferUsedEnd = Math.min(endPct, coreStartPct);
        const preBufferUnusedStart = 0;
        const preBufferUnusedEnd = Math.min(startPct, coreStartPct);

        const coreSegStart = Math.max(startPct, coreStartPct);
        const coreSegEnd = Math.min(endPct, coreEndPct);

        const postBufferUsedStart = Math.max(startPct, coreEndPct);
        const postBufferUsedEnd = endPct;
        const postBufferUnusedStart = Math.max(endPct, coreEndPct);
        const postBufferUnusedEnd = 100;

        return (
            <div style={{position: 'relative', height: '20px', backgroundColor: 'cyan', width: '80px'}}>
                {/* Pre-buffer: unused (gray) */}
                {event.enableBufferTimes && preBufferUnusedEnd > preBufferUnusedStart && (
                    <div
                        key={`${position.id}-pre-unused`}
                        style={{
                            position: 'absolute',
                            left: `${preBufferUnusedStart}%`,
                            width: `${preBufferUnusedEnd - preBufferUnusedStart}%`,
                            height: '100%',
                            backgroundColor: '#9e9e9e',
                        }}
                    />
                )}
                {/* Pre-buffer: used (purple) */}
                {event.enableBufferTimes && preBufferUsedEnd > preBufferUsedStart && (
                    <div
                        key={`${position.id}-pre`}
                        style={{
                            position: 'absolute',
                            left: `${preBufferUsedStart}%`,
                            width: `${preBufferUsedEnd - preBufferUsedStart}%`,
                            height: '100%',
                            backgroundColor: '#ab47bc',
                        }}
                    />
                )}
                {/* Core event segment (orange) */}
                {coreSegEnd > coreSegStart && (
                    <div
                        key={`${position.id}-core`}
                        style={{
                            position: 'absolute',
                            left: `${coreSegStart}%`,
                            width: `${coreSegEnd - coreSegStart}%`,
                            height: '100%',
                            backgroundColor: 'orange',
                        }}
                    />
                )}
                {/* Post-buffer: used (purple) */}
                {event.enableBufferTimes && postBufferUsedEnd > postBufferUsedStart && (
                    <div
                        key={`${position.id}-post`}
                        style={{
                            position: 'absolute',
                            left: `${postBufferUsedStart}%`,
                            width: `${postBufferUsedEnd - postBufferUsedStart}%`,
                            height: '100%',
                            backgroundColor: '#ab47bc',
                        }}
                    />
                )}
                {/* Post-buffer: unused (gray) */}
                {event.enableBufferTimes && postBufferUnusedEnd > postBufferUnusedStart && (
                    <div
                        key={`${position.id}-post-unused`}
                        style={{
                            position: 'absolute',
                            left: `${postBufferUnusedStart}%`,
                            width: `${postBufferUnusedEnd - postBufferUnusedStart}%`,
                            height: '100%',
                            backgroundColor: '#9e9e9e',
                        }}
                    />
                )}
            </div>
        );
    }


    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>Controller Positions</Typography>
                <Stack direction="row" spacing={2} sx={{ my: 2, }}>
                    <Box>
                        <EventPositionPublishAllButton event={event} positions={positions} />
                    </Box>
                    <Box>
                        <TogglePositionsLockButton event={event} />
                    </Box>
                    <Box>
                        <SendDiscordEventDataButton event={event} positions={positions}/>
                    </Box>
                    <Box sx={{ display: { xs: 'none', sm: 'inherit', }}}>
                       <ForcePositionsToggleSwitch event={event} /> 
                    </Box>
                    <Box sx={{display: {xs: 'none', sm: 'inherit',}}}>
                        <EventPositionCsvButton event={event} positions={positions}/>
                    </Box>
                </Stack>
                <Box sx={{ display: { sm: 'none', }}}>
                       <ForcePositionsToggleSwitch event={event} /> 
                </Box>
                <Box sx={{display: {sm: 'none',}}}>
                    <EventPositionCsvButton event={event} positions={positions}/>
                </Box>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Controller</TableCell>
                                <TableCell>Rq Pos</TableCell>
                                <TableCell>Rq Sec Pos</TableCell>
                                <TableCell>Rq Time</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell>Fin Pos</TableCell>
                                <TableCell>Fin Time</TableCell>
                                <TableCell>Fin Notes</TableCell>
                                { !event.archived && <TableCell>Actions</TableCell> }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {positions.map((position) => position.user && (

                                <TableRow key={position.id}>
                                    <TableCell>
                                        <ControllerChip
                                            user={position.user}
                                            soloCert={position.soloCert as any}
                                            published={position.published}
                                            eventInfo={{
                                                requestedPosition: position.requestedPosition ?? null,
                                                eventNotes: position.notes ?? null,
                                                finalPosition: position.finalPosition ?? null,
                                                finalNotes: position.finalNotes ?? null,
                                                assignedPosition: (position as any).assignedPosition ?? null,
                                                lastControlledEvent: lastControlledByUser[position.user.id] ?? null,
                                                certifications: certificationsByUser[position.user.id] ?? null,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{position.requestedPosition}</TableCell>
                                    <TableCell>{position.requestedSecondaryPosition}</TableCell>
                                    <TableCell>
                                        <Tooltip title={`${formatZuluDate(position.requestedStartTime)} - ${formatZuluDate(position.requestedEndTime)}`}>
                                            {getTimeRectangle(position, new Date(event.start), new Date(position.requestedStartTime), new Date(event.end), new Date(position.requestedEndTime))}
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>{position.notes}</TableCell>
                                    <TableCell>{position.finalPosition}</TableCell>
                                    <TableCell>
                                        <Tooltip title={`${formatZuluDate(position.finalStartTime || position.requestedStartTime)} - ${formatZuluDate(position.finalEndTime || position.requestedEndTime)}`}>
                                            {getTimeRectangle(position, new Date(event.start), new Date(position.finalStartTime || position.requestedStartTime), new Date(event.end), new Date(position.finalEndTime || position.requestedEndTime))}
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>{position.finalNotes}</TableCell>
                                    { !event.archived && <TableCell>
                                        <ButtonGroup variant="outlined" color="inherit" size="small">
                                            <EventPositionPublishButton event={event} position={position} />
                                            <EventPositionEditButton event={event} position={position} />
                                            <EventPositionDeleteButton event={event} position={position} />
                                        </ButtonGroup>
                                    </TableCell> }
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
}