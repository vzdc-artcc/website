import {EventPositionWithSolo} from "@/app/events/admin/events/[id]/manager/page";
import {
    Box,
    ButtonGroup,
    Card,
    CardContent,
    Chip,
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
import {getRating} from "@/lib/vatsim";
import Link from "next/link";
import {Event, EventPosition} from "@prisma/client";
import TogglePositionsLockButton from "./TogglePositionsLockButton";
import ForcePositionsToggleSwitch from "./ForcePositionsToggleSwitch";
import EventPositionDeleteButton from "./EventPositionDeleteButton";
import EventPositionEditButton from "./EventPositionEditButton";
import EventPositionPublishButton from "./EventPositionPublishButton";
import EventPositionPublishAllButton from "./EventPositionPublishAllButton";
import EventPositionCsvButton from "@/components/EventManager/EventPositionCsvButton";



export default async function EventPositionsTable({ event, positions }: { event: Event, positions: EventPositionWithSolo[] }) {

    const getTimeRectangle = (position: EventPosition, eventStart: Date, start: Date, eventEnd: Date, end: Date) => {

        if (eventStart.getTime() > start.getTime() || eventEnd.getTime() < end.getTime()) {
            return <>
                <div style={{ position: 'relative', height: '20px', backgroundColor: 'red', width: '80px' }} />
                <Typography variant="caption">INVALID (hover)</Typography>
            </>;
        }

        const totalDuration = eventEnd.getTime() - eventStart.getTime();
        const startOffset = start.getTime() - eventStart.getTime();
        const endOffset = end.getTime() - eventStart.getTime();
    
        const startPercentage = (startOffset / totalDuration) * 100;
        const endPercentage = (endOffset / totalDuration) * 100;
    
        return <div style={{ position: 'relative', height: '20px', backgroundColor: 'cyan', width: '80px' }}>
            <div key={position.id} style={{ position: 'absolute', left: `${startPercentage}%`, width: `${endPercentage - startPercentage}%`, height: '100%', backgroundColor: 'orange' }} />
            </div>;
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
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Controller</TableCell>
                                <TableCell>Solo?</TableCell>
                                <TableCell>Requested Position</TableCell>
                                <TableCell>Requested Time</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell>Final Position</TableCell>
                                <TableCell>Final Time</TableCell>
                                <TableCell>Final Notes</TableCell>
                                { !event.archived && <TableCell>Actions</TableCell> }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {positions.map((position) => position.user && (
                                <TableRow key={position.id}>
                                    <TableCell>
                                        <Link href={`/admin/controller/${position.user.cid}`} passHref target="_blank">
                                            <Chip
                                                label={`${position.user.firstName} ${position.user.lastName} - ${getRating(position.user.rating)}` || 'Unknown'}
                                                color={position.published ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </Link>
                                    </TableCell>
                                    <TableCell>{position.soloCert ? 
                                    <Stack direction="column" alignItems="center">
                                        <Typography variant="caption">{position.soloCert.position}</Typography>
                                        <Typography variant="caption">{formatZuluDate(position.soloCert.expires)}</Typography>
                                    </Stack>
                                    : ''}</TableCell>
                                    <TableCell>{position.requestedPosition}</TableCell>
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