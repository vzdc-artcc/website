'use client';

import React from 'react';
import {useParams} from "next/navigation";
import {Box, Card, CardContent, Chip, Grid, Typography} from "@mui/material";
import {calculatePassRate} from "@/lib/trainingStats";
import {useTrainingStats} from "@/lib/osmium/hooks/training";
import TrainingSessionsByMonthGraph from "@/components/TrainingStatistics/TrainingSessionsByMonthGraph";
import LessonDistributionGraph from "@/components/TrainingStatistics/LessonDistributionGraph";


export default function Page() {
    const params = useParams();
    const year = Array.isArray(params.year) ? params.year[0] : params.year;
    const numYear = parseInt(year ?? '');

    const {data: stats, isLoading} = useTrainingStats({
        year: Number.isNaN(numYear) ? undefined : numYear,
    });

    if (isNaN(numYear) || numYear < 2000 || numYear > new Date().getFullYear()) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h4">Invalid Year</Typography>
                    <Typography sx={{mt: 1,}}>Year must be after 2000 and not after this year</Typography>
                </CardContent>
            </Card>
        );
    }

    if (isLoading || !stats) {
        return <Typography>Loading statistics…</Typography>;
    }

    const totalHoursInYear = stats.total_hours.toFixed(3);
    const yearPassRate = calculatePassRate(stats.passed, stats.failed);

    return (
        <Grid container columns={30} spacing={2}>
            <Grid size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h4">Training Statistics</Typography>
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
                        <Typography variant="h4">{totalHoursInYear}</Typography>
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
                            label={`${yearPassRate.percentage}%`}
                            color={yearPassRate.color}
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
            {stats.top_trainers.map((trainer, idx) => (
                <Grid
                    key={trainer.id}
                    size={{
                        xs: 30,
                        md: 10
                    }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ mb: 2 }}>
                                    <Typography
                                        variant="h5">{idx + 1} - {trainer.preferred_name || `${trainer.first_name ?? ''} ${trainer.last_name ?? ''}`}
                                    </Typography>
                                <Typography variant="body1">{trainer.cid}</Typography>
                            </Box>
                            <Typography variant="h6">{trainer.hours.toPrecision(3)} hours</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
            <Grid size={30}>
                <Card>
                    <CardContent>
                        <TrainingSessionsByMonthGraph data={stats.monthly_sessions} />
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={30}>
                <Card>
                    <CardContent>
                        {stats.lesson_distribution.length > 0 ? (
                            <LessonDistributionGraph data={stats.lesson_distribution} />
                        ) : (
                            <Typography variant="body2" sx={{ mt: 2 }}>No lesson data available for this year.</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}
