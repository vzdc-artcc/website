'use client';

import React from 'react';
import {useParams} from "next/navigation";
import {getMonth} from "@/lib/date";
import {Card, CardContent, Chip, Grid, Typography} from "@mui/material";
import {notFound} from "next/navigation";
import {calculatePassRate} from "@/lib/trainingStats";
import {useTrainingStats} from "@/lib/osmium/hooks/training";
import {useUserByCid} from "@/lib/osmium/hooks/users";
import LessonDistributionGraph from "@/components/TrainingStatistics/LessonDistributionGraph";
import TrainingSessionsByMonthGraph from "@/components/TrainingStatistics/TrainingSessionsByMonthGraph";

export default function Page() {
    const params = useParams();
    const year = Array.isArray(params.year) ? params.year[0] : params.year;
    const month = Array.isArray(params.month) ? params.month[0] : params.month;
    const cid = Array.isArray(params.cid) ? params.cid[0] : params.cid;

    const numYear = parseInt(year ?? '');
    const isYearScope = month === '-';
    const numMonth = isYearScope ? -1 : parseInt(month ?? '');

    const {data: resolvedUser, isLoading: userLoading} = useUserByCid(cid ? Number(cid) : undefined);

    const invalidYear = isNaN(numYear) || numYear < 2000 || numYear > new Date().getFullYear();
    const invalidMonth = !isYearScope && (isNaN(numMonth) || numMonth < 0 || numMonth > 11);

    const {data: stats, isLoading: statsLoading} = useTrainingStats({
        year: invalidYear || invalidMonth ? undefined : numYear,
        month: isYearScope ? undefined : numMonth,
        cid: cid ? Number(cid) : undefined,
    });

    if (!userLoading && !resolvedUser) {
        notFound();
    }

    if (invalidYear) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h4">Invalid Year</Typography>
                    <Typography sx={{mt: 1,}}>Year must be after 2000 and not after this year.</Typography>
                </CardContent>
            </Card>
        );
    }

    if (invalidMonth) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h4">Invalid Month</Typography>
                    <Typography sx={{mt: 1,}}>Month must be within 0-11 range or &apos;-&apos; for all months.</Typography>
                </CardContent>
            </Card>
        );
    }

    if (userLoading || statsLoading || !resolvedUser || !stats) {
        return <Typography>Loading statistics…</Typography>;
    }

    const profile = resolvedUser.full?.profile;
    const displayName = profile?.preferred_name || `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`;
    const passRate = calculatePassRate(stats.passed, stats.failed);

    return (
        <Grid container columns={30} spacing={2}>
            <Grid size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h5">{displayName}</Typography>
                        <Typography variant="body2">{profile?.preferred_name && `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`}</Typography>
                        <Typography>{resolvedUser.basic.rating ?? 'Unknown'} • {resolvedUser.basic.cid}</Typography>
                        <Typography>{isYearScope ? `${numYear} Yearly Training Statistics` : `${getMonth(numMonth)}, ${numYear} Statistics`}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Sessions</Typography>
                        <Typography variant="h4">{stats.sessions}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Training Hours</Typography>
                        <Typography variant="h4">{stats.total_hours.toFixed(3)}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Sessions Passed</Typography>
                        <Typography variant="h4">{stats.passed}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Sessions Failed</Typography>
                        <Typography variant="h4">{stats.failed}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom>Pass Rate</Typography>
                        <Chip
                            label={`${passRate.percentage}%`}
                            color={passRate.color}
                            variant="filled"
                            size="medium"
                        />
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom>Most Run Session</Typography>
                        {stats.most_run_lesson.identifier ? (
                            <Chip
                                label={`${stats.most_run_lesson.identifier} (${stats.most_run_lesson.count} times)`}
                                color="info"
                                variant="filled"
                                size="medium"
                            />
                        ) : (
                            <Typography variant="body2">N/A</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>
            {isYearScope && (
                <Grid size={30}>
                    <Card>
                        <CardContent>
                            <TrainingSessionsByMonthGraph data={stats.monthly_sessions}/>
                        </CardContent>
                    </Card>
                </Grid>
            )}
            <Grid size={30}>
                <Card>
                    <CardContent>
                        {stats.lesson_distribution.length > 0 ? (
                            <LessonDistributionGraph data={stats.lesson_distribution}/>
                        ) : (
                            <Typography variant="body2" sx={{mt: 2}}>No lesson data available for this instructor in
                                this {isYearScope ? 'year' : 'month'}.</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
