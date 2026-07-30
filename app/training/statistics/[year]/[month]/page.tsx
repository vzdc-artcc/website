'use client';

import {Box, Card, CardContent, Chip, Grid, Typography} from "@mui/material";
import {getMonth} from "@/lib/date";
import React from "react";
import {useParams} from "next/navigation";
import {calculatePassRate} from "@/lib/trainingStats";
import {useTrainingStats} from "@/lib/osmium/hooks/training";
import LessonDistributionGraph from "@/components/TrainingStatistics/LessonDistributionGraph";
import PassFailGraph from "@/components/TrainingStatistics/PassFailGraph";


export default function Page() {
    const params = useParams();
    const year = Array.isArray(params.year) ? params.year[0] : params.year;
    const month = Array.isArray(params.month) ? params.month[0] : params.month;

    const numYear = parseInt(year ?? '');
    const numMonth = parseInt(month ?? '');

    const invalid = isNaN(numYear) || numYear < 2000 || numYear > new Date().getFullYear() || isNaN(numMonth) || numMonth < 0 || numMonth > 11;

    const {data: stats, isLoading} = useTrainingStats({
        year: invalid ? undefined : numYear,
        month: invalid ? undefined : numMonth,
    });

    if (invalid) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h4">Invalid Timeframe</Typography>
                    <Typography sx={{mt: 1,}}>Year must be after 2000 and not after this year. Month must also be within
                        0-11 range.</Typography>
                </CardContent>
            </Card>
        );
    }

    if (isLoading || !stats) {
        return <Typography>Loading statistics…</Typography>;
    }

    const totalHours = stats.total_hours.toFixed(3);
    const monthPassRate = calculatePassRate(stats.passed, stats.failed);

    return (
        <Grid container columns={30} spacing={2}>
            <Grid size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h4">{getMonth(numMonth)}, {numYear} Statistics</Typography>
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
                        <Typography variant="h4">{totalHours}</Typography>
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
                            label={`${monthPassRate.percentage}%`}
                            color={monthPassRate.color}
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
                                    variant="h5">{idx + 1} - {trainer.preferred_name?.trim() || `${trainer.first_name ?? ''} ${trainer.last_name ?? ''}`.trim() || trainer.display_name || trainer.cid}
                                </Typography>
                                <Typography variant="body1">{trainer.cid}</Typography>
                            </Box>
                            <Typography variant="h6">{trainer.hours.toPrecision(3)} hours</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
            {(stats.passed > 0 || stats.failed > 0) && (
                <Grid size={{xs: 30, md: 12}}>
                    <Card>
                        <CardContent>
                            <PassFailGraph passed={stats.passed} failed={stats.failed} />
                        </CardContent>
                    </Card>
                </Grid>
            )}
            <Grid size={{xs: 30, md: (stats.passed > 0 || stats.failed > 0) ? 18 : 30}}>
                <Card>
                    <CardContent>
                        {stats.lesson_distribution.length > 0 ? (
                            <LessonDistributionGraph data={stats.lesson_distribution} />
                        ) : (
                            <Typography variant="body2" sx={{ mt: 2 }}>No lesson data available for this month.</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>

        </Grid>
    )
}
