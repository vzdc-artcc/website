'use client';
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
import TogglePositionsLockButton from "./TogglePositionsLockButton";
import ForcePositionsToggleSwitch from "./ForcePositionsToggleSwitch";
import EventPositionDeleteButton from "./EventPositionDeleteButton";
import EventPositionEditButton from "./EventPositionEditButton";
import EventPositionPublishButton from "./EventPositionPublishButton";
import EventPositionPublishAllButton from "./EventPositionPublishAllButton";
import EventPositionCsvButton from "@/components/EventManager/EventPositionCsvButton";
import ControllerChip from "@/components/EventManager/ControllerChip";
import {useEventPositions} from "@/lib/osmium/hooks/events";

interface EventLike {
    id: string;
    title: string;
    preset_positions: string[];
    enable_buffer_times: boolean;
    starts_at: string;
    ends_at: string;
    hidden: boolean;
    archived_at?: string | null;
    manual_positions_open: boolean;
    positions_locked: boolean;
}

export default function EventPositionsTable({event}: { event: EventLike }) {
    const {data} = useEventPositions(event.id, {pageSize: 200});
    const positions = (data?.items ?? []).slice().sort((a, b) => (a.user_name || '').localeCompare(b.user_name || ''));

    const getTimeRectangle = (positionId: string, eventStart: Date, start: Date, eventEnd: Date, end: Date) => {

        const bufferMs = 60 * 60 * 1000 * 2;
        const totalStart = event.enable_buffer_times ? new Date(eventStart.getTime() - bufferMs) : eventStart;
        const totalEnd = event.enable_buffer_times ? new Date(eventEnd.getTime() + bufferMs) : eventEnd;

        if (totalStart.getTime() > start.getTime() || totalEnd.getTime() < end.getTime()) {
            return <>
                <div style={{position: 'relative', height: '20px', backgroundColor: 'red', width: '80px'}}/>
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
                {event.enable_buffer_times && preBufferUnusedEnd > preBufferUnusedStart && (
                    <div key={`${positionId}-pre-unused`} style={{
                        position: 'absolute', left: `${preBufferUnusedStart}%`,
                        width: `${preBufferUnusedEnd - preBufferUnusedStart}%`, height: '100%', backgroundColor: '#9e9e9e',
                    }}/>
                )}
                {event.enable_buffer_times && preBufferUsedEnd > preBufferUsedStart && (
                    <div key={`${positionId}-pre`} style={{
                        position: 'absolute', left: `${preBufferUsedStart}%`,
                        width: `${preBufferUsedEnd - preBufferUsedStart}%`, height: '100%', backgroundColor: '#ab47bc',
                    }}/>
                )}
                {coreSegEnd > coreSegStart && (
                    <div key={`${positionId}-core`} style={{
                        position: 'absolute', left: `${coreSegStart}%`,
                        width: `${coreSegEnd - coreSegStart}%`, height: '100%', backgroundColor: 'orange',
                    }}/>
                )}
                {event.enable_buffer_times && postBufferUsedEnd > postBufferUsedStart && (
                    <div key={`${positionId}-post`} style={{
                        position: 'absolute', left: `${postBufferUsedStart}%`,
                        width: `${postBufferUsedEnd - postBufferUsedStart}%`, height: '100%', backgroundColor: '#ab47bc',
                    }}/>
                )}
                {event.enable_buffer_times && postBufferUnusedEnd > postBufferUnusedStart && (
                    <div key={`${positionId}-post-unused`} style={{
                        position: 'absolute', left: `${postBufferUnusedStart}%`,
                        width: `${postBufferUnusedEnd - postBufferUnusedStart}%`, height: '100%', backgroundColor: '#9e9e9e',
                    }}/>
                )}
            </div>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>Controller Positions</Typography>
                <Stack direction="row" spacing={2} sx={{my: 2,}}>
                    <Box>
                        <EventPositionPublishAllButton eventId={event.id} positions={positions} archived={!!event.archived_at}/>
                    </Box>
                    <Box>
                        <TogglePositionsLockButton event={event}/>
                    </Box>
                    <Box sx={{display: {xs: 'none', sm: 'inherit',}}}>
                        <ForcePositionsToggleSwitch event={event}/>
                    </Box>
                    <Box sx={{display: {xs: 'none', sm: 'inherit',}}}>
                        <EventPositionCsvButton eventTitle={event.title} positions={positions}/>
                    </Box>
                </Stack>
                <Box sx={{display: {sm: 'none',}}}>
                    <ForcePositionsToggleSwitch event={event}/>
                </Box>
                <Box sx={{display: {sm: 'none',}}}>
                    <EventPositionCsvButton eventTitle={event.title} positions={positions}/>
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
                                {!event.archived_at && <TableCell>Actions</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {positions.map((position) => (
                                <TableRow key={position.id}>
                                    <TableCell>
                                        <ControllerChip name={position.user_name} cid={position.user_cid} published={position.published}/>
                                    </TableCell>
                                    <TableCell>{position.requested_position}</TableCell>
                                    <TableCell>{position.requested_secondary_position}</TableCell>
                                    <TableCell>
                                        <Tooltip title={`${formatZuluDate(new Date(position.requested_start_time || event.starts_at))} - ${formatZuluDate(new Date(position.requested_end_time || event.ends_at))}`}>
                                            {getTimeRectangle(position.id, new Date(event.starts_at), new Date(position.requested_start_time || event.starts_at), new Date(event.ends_at), new Date(position.requested_end_time || event.ends_at))}
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>{position.notes}</TableCell>
                                    <TableCell>{position.final_position}</TableCell>
                                    <TableCell>
                                        <Tooltip title={`${formatZuluDate(new Date(position.final_start_time || position.requested_start_time || event.starts_at))} - ${formatZuluDate(new Date(position.final_end_time || position.requested_end_time || event.ends_at))}`}>
                                            {getTimeRectangle(position.id, new Date(event.starts_at), new Date(position.final_start_time || position.requested_start_time || event.starts_at), new Date(event.ends_at), new Date(position.final_end_time || position.requested_end_time || event.ends_at))}
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>{position.final_notes}</TableCell>
                                    {!event.archived_at && <TableCell>
                                        <ButtonGroup variant="outlined" color="inherit" size="small">
                                            <EventPositionPublishButton eventId={event.id} position={position}/>
                                            <EventPositionEditButton event={event} position={position}/>
                                            <EventPositionDeleteButton eventId={event.id} position={position}/>
                                        </ButtonGroup>
                                    </TableCell>}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
}
