import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {EventType} from "@/generated/prisma/enums";
import {Feedback} from "@/generated/prisma/client";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Card,
    CardContent,
    Grid,
    Rating,
    Stack,
    Typography
} from "@mui/material";
import {getChips} from "@/lib/staffPositions";
import {User} from "next-auth";
import {getRating} from "@/lib/vatsim";
import {formatZuluDate} from "@/lib/date";
import {ExpandMore} from "@mui/icons-material";
import {getIconForCertificationOption} from "@/lib/certification";
import EventStatisticsOnlinePositionTable from "@/components/EventStatistics/EventStatisticsOnlinePositionTable";

export default async function EventStatisticsInformation({cid,}: { cid: string, }) {
    const user = await prisma.user.findUnique({
        where: {
            cid,
        },
    });

    if (!user) {
        notFound();
    }

    const feedback = await prisma.feedback.findMany({
        where: {
            controller: {
                cid,
            },
            status: 'RELEASED',
        },
        orderBy: {
            decidedAt: 'desc',
        }
    });

    const eventPositions = await prisma.eventPosition.findMany({
        where: {
            user: {
                cid,
            },
            published: true,
        },
        include: {
            event: true,
        },
        orderBy: {
            event: {
                start: 'desc',
            },
        },
    });

    const certificationTypes = await prisma.certificationType.findMany({
        orderBy: {
            order: 'asc',
        }
    });

    const certifications = await prisma.certification.findMany({
        where: {
            controller: {
                cid,
            },
            certificationOption: {
                not: 'NONE',
            },
        },
    });

    const soloCertification = await prisma.soloCertification.findFirst({
        where: {
            controller: {
                cid,
            },
            expires: {
                gt: new Date(),
            },
        }
    });

    const onlinePositions = await prisma.controllerPosition.findMany({
        where: {
            log: {
                user: {
                    cid,
                },
            },
            active: false,
        },
        orderBy: {
            start: 'desc',
        },
    });

    const msPerHour = 1000 * 60 * 60;

    const sumPositionMs = (positions: typeof onlinePositions, facility?: number, since?: Date) => {
        return positions.reduce((acc, pos) => {
            if (typeof facility !== 'undefined' && pos.facility !== facility) return acc;
            if (!pos.end) return acc;

            // If a position started before the `since` boundary, only count the overlapping portion.
            const start = since && pos.start < since ? since : pos.start;
            const end = pos.end;
            const delta = end.getTime() - start.getTime();
            if (delta <= 0) return acc;
            return acc + delta;
        }, 0);
    };

    const totalDeliveryHours = sumPositionMs(onlinePositions, 2) / msPerHour;
    const totalGroundHours = sumPositionMs(onlinePositions, 3) / msPerHour;
    const totalTowerHours = sumPositionMs(onlinePositions, 4) / msPerHour;
    const totalApproachHours = sumPositionMs(onlinePositions, 5) / msPerHour;
    const totalCenterHours = sumPositionMs(onlinePositions, 6) / msPerHour;

    const totalHours = (totalDeliveryHours + totalGroundHours + totalTowerHours + totalApproachHours + totalCenterHours);

    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

    const totalDeliveryHoursLast60 = sumPositionMs(onlinePositions, 2, sixtyDaysAgo) / msPerHour;
    const totalGroundHoursLast60 = sumPositionMs(onlinePositions, 3, sixtyDaysAgo) / msPerHour;
    const totalTowerHoursLast60 = sumPositionMs(onlinePositions, 4, sixtyDaysAgo) / msPerHour;
    const totalApproachHoursLast60 = sumPositionMs(onlinePositions, 5, sixtyDaysAgo) / msPerHour;
    const totalCenterHoursLast60 = sumPositionMs(onlinePositions, 6, sixtyDaysAgo) / msPerHour;

    const totalHoursLast60 = (totalDeliveryHoursLast60 + totalGroundHoursLast60 + totalTowerHoursLast60 + totalApproachHoursLast60 + totalCenterHoursLast60);

    const eventPositionLast60Days = eventPositions.filter((ep) => {
        const now = new Date();
        const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
        return ep.event.start >= sixtyDaysAgo;
    });

    const bigEventTypes: EventType[] = ['HOME', 'FRIDAY_NIGHT_OPERATIONS', 'SUPPORT_REQUIRED',];

    const eventHours = eventPositions.reduce((acc, ep) => {
        if (!ep.finalStartTime || !ep.finalEndTime) return acc;
        const eventDuration = (ep.finalEndTime.getTime() - ep.finalStartTime.getTime()) / (1000 * 60 * 60); // duration in hours
        return acc + eventDuration;
    }, 0);

    const eventHoursBigEvents = eventPositions.reduce((acc, ep) => {
        if (!ep.finalStartTime || !ep.finalEndTime) return acc;
        if (!bigEventTypes.includes(ep.event.type)) return acc; // Only count events with 100+ attendees
        const eventDuration = (ep.finalEndTime.getTime() - ep.finalStartTime.getTime()) / (1000 * 60 * 60); // duration in hours
        return acc + eventDuration;
    }, 0);

    const feedbackLast60Days = feedback.filter((f) => {
        const now = new Date();
        const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
        return f.submittedAt >= sixtyDaysAgo;
    });

    const averageFeedback = (feedback: Feedback[]) => {
        if (feedback.length === 0) return 0;
        const total = feedback.reduce((acc, f) => acc + f.rating, 0);
        return total / feedback.length;
    }

    const calculateMonthsSinceJoin = (joinDate: Date): string => {
        const now = new Date();
        const months = (now.getFullYear() - joinDate.getFullYear()) * 12 + (now.getMonth() - joinDate.getMonth());
        const dayDifference = now.getDate() - joinDate.getDate();
        const exactMonths = months + (dayDifference / 30.44);
        return Math.max(0, exactMonths).toFixed(3);
    }

    return (
        <Grid container columns={6} spacing={2}>
            <Grid size={6}>
                <Card>
                    <CardContent>
                        <Typography
                            variant="h6">{user.fullName} ({user.operatingInitials}) {getChips(user as User)}</Typography>
                        <Typography gutterBottom><b>{user.controllerStatus}</b> {getRating(user.rating)} | {user.cid}
                        </Typography>
                        <Typography gutterBottom>Join Date (after suspension, if
                            applicable): {formatZuluDate(user.joinDate)} ({calculateMonthsSinceJoin(user.joinDate)} months)</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 6, md: 3, xl: 2,}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Events</Typography>
                        <Typography>Published event hours:</Typography>
                        <Typography variant="subtitle2" gutterBottom>{eventHours.toFixed(3)}</Typography>
                        <Typography>Published "big" event hours:</Typography>
                        <Typography variant="subtitle2" gutterBottom>{eventHoursBigEvents.toFixed(3)}</Typography>
                        <Typography>Published positions in last 60 days:</Typography>
                        <Typography variant="subtitle2" gutterBottom>{eventPositionLast60Days.length}</Typography>
                        <Typography>Published positions all time:</Typography>
                        <Typography variant="subtitle2" gutterBottom>{eventPositions.length}</Typography>
                        <Accordion variant="outlined">
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Typography>All Published positions (from recent)</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{maxHeight: 200, overflowY: 'auto',}}>
                                    {eventPositions.map((ep) => (
                                        <Typography key={ep.id} variant="caption"
                                                    gutterBottom>{ep.finalPosition} - {ep.event.name} - {formatZuluDate(ep.event.start)}</Typography>
                                    ))}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 6, md: 3, xl: 2,}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Feedback</Typography>
                        <Typography>Released:</Typography>
                        <Typography variant="subtitle2" gutterBottom>{feedback.length}</Typography>
                        <Typography>Less than 4 stars:</Typography>
                        <Typography variant="subtitle2"
                                    gutterBottom>{feedback.filter((f) => f.rating < 4).length}</Typography>
                        <Typography>Average last 60 days:</Typography>
                        {feedbackLast60Days.length >= 0 ?
                            <Rating readOnly value={averageFeedback(feedbackLast60Days)}/> :
                            <Typography variant="caption">N/A</Typography>}
                        <Typography>Average all time:</Typography>
                        {feedback.length >= 0 ? <Rating readOnly value={averageFeedback(feedback)}/> :
                            <Typography variant="caption">N/A</Typography>}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 6, md: 3, xl: 2,}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Roster</Typography>
                        {certificationTypes.map((ct) => (
                            <Stack key={ct.id} direction="row" spacing={1} alignItems="center">
                                <Typography gutterBottom>{ct.name}:</Typography>
                                {getIconForCertificationOption(certifications.find((c) => c.certificationTypeId === ct.id)?.certificationOption || 'NONE')}
                            </Stack>
                        ))}
                        {soloCertification &&
                            <Box sx={{mt: 2,}}>
                                <Typography fontWeight="bold">Solo
                                    Certification: {soloCertification.position}</Typography>
                                <Typography>Expires: {formatZuluDate(soloCertification.expires)}</Typography>
                            </Box>}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 6, md: 3,}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Online ATC Positions</Typography>
                        <EventStatisticsOnlinePositionTable allPositions={onlinePositions}/>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 6, md: 3,}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Total ATC Hours</Typography>
                        <Stack direction={{xs: 'column', lg: 'row'}} spacing={1}>
                            <Card variant="outlined" sx={{width: '100%', height: '100%',}}>
                                <CardContent>
                                    <Typography gutterBottom fontWeight="bold">Last 60
                                        days: {totalHoursLast60.toFixed(3)}</Typography>
                                    <Typography>Delivery: {totalDeliveryHoursLast60.toFixed(3)}</Typography>
                                    <Typography>Ground: {totalGroundHoursLast60.toFixed(3)}</Typography>
                                    <Typography>Tower: {totalTowerHoursLast60.toFixed(3)}</Typography>
                                    <Typography>Approach: {totalApproachHoursLast60.toFixed(3)}</Typography>
                                    <Typography>Center: {totalCenterHoursLast60.toFixed(3)}</Typography>
                                </CardContent>
                            </Card>
                            <Card variant="outlined" sx={{width: '100%', height: '100%',}}>
                                <CardContent>
                                    <Typography gutterBottom fontWeight="bold">ALL: {totalHours.toFixed(3)}</Typography>
                                    <Typography>Delivery: {totalDeliveryHours.toFixed(3)}</Typography>
                                    <Typography>Ground: {totalGroundHours.toFixed(3)}</Typography>
                                    <Typography>Tower: {totalTowerHours.toFixed(3)}</Typography>
                                    <Typography>Approach: {totalApproachHours.toFixed(3)}</Typography>
                                    <Typography>Center: {totalCenterHours.toFixed(3)}</Typography>
                                </CardContent>
                            </Card>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}