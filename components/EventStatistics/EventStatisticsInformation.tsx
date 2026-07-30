'use client';

import React from 'react';
import {notFound} from "next/navigation";
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
import UserStaffPositionChips from "@/components/StaffPositions/UserStaffPositionChips";
import {formatZuluDate} from "@/lib/date";
import {ExpandMore} from "@mui/icons-material";
import {getIconForCertificationOption} from "@/lib/certification";
import EventStatisticsOnlinePositionTable from "@/components/EventStatistics/EventStatisticsOnlinePositionTable";
import {useUserByCid} from "@/lib/osmium/hooks/users";
import {useReceivedFeedback} from "@/lib/osmium/hooks/feedback";
import {useUserEventPositions} from "@/lib/osmium/hooks/events";
import {useCertificationTypes, useUserCertifications, useUserSoloCertifications} from "@/lib/osmium/hooks/certifications";
import {useControllerTotals, useControllerPositions} from "@/lib/osmium/hooks/stats";

// Big events (100+ attendees) — event_type values that count toward big-event hours.
const BIG_EVENT_TYPES = ['HOME', 'FRIDAY_NIGHT_OPERATIONS', 'SUPPORT_REQUIRED'];

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

export default function EventStatisticsInformation({cid,}: { cid: string, }) {
    const numCid = Number(cid);
    const sixtyDaysAgo = new Date(Date.now() - SIXTY_DAYS_MS);

    const {data: resolvedUser, isLoading: userLoading} = useUserByCid(numCid);
    const {data: feedbackData} = useReceivedFeedback(numCid, {status: 'RELEASED', pageSize: 200});
    const {data: eventPositionsData} = useUserEventPositions(numCid);
    const {data: certTypesData} = useCertificationTypes();
    const {data: certificationsData} = useUserCertifications(numCid);
    const {data: soloData} = useUserSoloCertifications(numCid);
    const {data: totalsAll} = useControllerTotals(numCid);
    const {data: totals60} = useControllerTotals(numCid, {since: sixtyDaysAgo.toISOString()});
    const {data: positionsData} = useControllerPositions(numCid);

    if (!userLoading && !resolvedUser) {
        notFound();
    }

    if (userLoading || !resolvedUser) {
        return <Typography>Loading controller statistics…</Typography>;
    }

    const profile = resolvedUser.full?.profile;
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || resolvedUser.basic.name;
    const joinDate = profile?.join_date ? new Date(profile.join_date) : null;

    const feedback = feedbackData?.items ?? [];
    const eventPositions = eventPositionsData?.items ?? [];
    const certificationTypes = [...(certTypesData?.items ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    const certifications = certificationsData?.items ?? [];
    const soloCertification = (soloData?.items ?? []).find((s) => new Date(s.expires) > new Date());
    const onlinePositions = (positionsData?.items ?? []).map((p) => ({
        position: p.position_name,
        started_at: p.started_at,
        ended_at: p.ended_at,
    }));

    const eventPositionLast60Days = eventPositions.filter((ep) => new Date(ep.event_starts_at) >= sixtyDaysAgo);

    const durationHours = (start?: string | null, end?: string | null) => {
        if (!start || !end) return 0;
        return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
    };

    const eventHours = eventPositions.reduce((acc, ep) => acc + durationHours(ep.final_start_time, ep.final_end_time), 0);
    const eventHoursBigEvents = eventPositions.reduce((acc, ep) => {
        if (!BIG_EVENT_TYPES.includes(ep.event_type)) return acc;
        return acc + durationHours(ep.final_start_time, ep.final_end_time);
    }, 0);

    const feedbackLast60Days = feedback.filter((f) => new Date(f.submitted_at) >= sixtyDaysAgo);

    const averageFeedback = (items: typeof feedback) => {
        if (items.length === 0) return 0;
        return items.reduce((acc, f) => acc + f.rating, 0) / items.length;
    };

    const calculateMonthsSinceJoin = (date: Date): string => {
        const now = new Date();
        const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
        const dayDifference = now.getDate() - date.getDate();
        const exactMonths = months + (dayDifference / 30.44);
        return Math.max(0, exactMonths).toFixed(3);
    };

    return (
        <Grid container columns={6} spacing={2}>
            <Grid size={6}>
                <Card>
                    <CardContent>
                        <Typography
                            variant="h6">{fullName} ({profile?.operating_initials}) <UserStaffPositionChips cid={resolvedUser.basic.cid}/></Typography>
                        <Typography gutterBottom><b>{profile?.controller_status}</b> {resolvedUser.basic.rating ?? 'Unknown'} | {resolvedUser.basic.cid}
                        </Typography>
                        <Typography gutterBottom>Join Date (after suspension, if
                            applicable): {joinDate ? `${formatZuluDate(joinDate)} (${calculateMonthsSinceJoin(joinDate)} months)` : 'N/A'}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 6, md: 3, xl: 2,}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Events</Typography>
                        <Typography>Published event hours:</Typography>
                        <Typography variant="subtitle2" gutterBottom>{eventHours.toFixed(3)}</Typography>
                        <Typography>Published big* event hours:</Typography>
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
                                                    gutterBottom>{ep.final_position} - {ep.event_title} - {formatZuluDate(new Date(ep.event_starts_at))}<br/></Typography>
                                    ))}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                        <Typography variant="caption" fontSize={10}>*A big event is one of the
                            following: {BIG_EVENT_TYPES.join(', ')}.</Typography>
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
                        <Rating readOnly value={averageFeedback(feedbackLast60Days)}/>
                        <Typography>Average all time:</Typography>
                        <Rating readOnly value={averageFeedback(feedback)}/>
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
                                {getIconForCertificationOption(certifications.find((c) => c.certification_type_id === ct.id)?.certification_option || 'NONE')}
                            </Stack>
                        ))}
                        {soloCertification &&
                            <Box sx={{mt: 2,}}>
                                <Typography fontWeight="bold">Solo
                                    Certification: {soloCertification.position}</Typography>
                                <Typography>Expires: {formatZuluDate(new Date(soloCertification.expires))}</Typography>
                            </Box>}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 6, md: 3,}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Past ATC Positions</Typography>
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
                                        days: {(totals60?.active_hours ?? 0).toFixed(3)}</Typography>
                                    <Typography>Delivery: {(totals60?.delivery_hours ?? 0).toFixed(3)}</Typography>
                                    <Typography>Ground: {(totals60?.ground_hours ?? 0).toFixed(3)}</Typography>
                                    <Typography>Tower: {(totals60?.tower_hours ?? 0).toFixed(3)}</Typography>
                                    <Typography>Approach: {(totals60?.tracon_hours ?? 0).toFixed(3)}</Typography>
                                    <Typography>Center: {(totals60?.center_hours ?? 0).toFixed(3)}</Typography>
                                </CardContent>
                            </Card>
                            <Card variant="outlined" sx={{width: '100%', height: '100%',}}>
                                <CardContent>
                                    <Typography gutterBottom fontWeight="bold">ALL: {(totalsAll?.active_hours ?? 0).toFixed(3)}</Typography>
                                    <Typography>Delivery: {(totalsAll?.delivery_hours ?? 0).toFixed(3)}</Typography>
                                    <Typography>Ground: {(totalsAll?.ground_hours ?? 0).toFixed(3)}</Typography>
                                    <Typography>Tower: {(totalsAll?.tower_hours ?? 0).toFixed(3)}</Typography>
                                    <Typography>Approach: {(totalsAll?.tracon_hours ?? 0).toFixed(3)}</Typography>
                                    <Typography>Center: {(totalsAll?.center_hours ?? 0).toFixed(3)}</Typography>
                                </CardContent>
                            </Card>
                        </Stack>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
