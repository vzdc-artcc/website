import {Box, Card, CardContent, Grid2, IconButton, Stack, Tooltip, Typography, Chip} from "@mui/material";
import {getMonth} from "@/lib/date";
import React from "react";
import {
    getAllSessionsInMonth,
    getFailedSessionsCountInMonth,
    getPassedSessionsCountInMonth,
    getTopTrainingStaffByHours,
    startOfMonthUTC,
    endOfMonthUTC,
    calculatePassRate, getMostRunLesson, getLessonDistributionData
} from "@/actions/trainingStats";
import Link from "next/link";
import {StackedLineChart} from "@mui/icons-material";
import LessonDistributionGraph from "@/components/TrainingStatistics/LessonDistributionGraph";


export default async function Page(props: { params: Promise<{ year: string, month: string }> }) {
    const params = await props.params;

    const {year, month} = params;

    const numYear = parseInt(year);
    const numMonth = parseInt(month);

    if (isNaN(numYear) || numYear < 2000 || numYear > new Date().getFullYear() || isNaN(numMonth) || numMonth < 0 || numMonth > 11) {
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

    const sessions = await getAllSessionsInMonth(year, month);

    const totalHours = sessions.reduce((sum, session) => {
        const duration = (session.end.getTime() - session.start.getTime()) / (1000 * 60 * 60);
        return sum + duration;
    }, 0).toFixed(3);

    const monthStart = startOfMonthUTC(numYear, numMonth);
    const monthEnd = endOfMonthUTC(numYear, numMonth);
    const top3Trainers = await getTopTrainingStaffByHours(3, monthStart, monthEnd);

    const monthPassedSessions = await getPassedSessionsCountInMonth(numYear, numMonth)
    const monthFailedSessions = await getFailedSessionsCountInMonth(numYear, numMonth)

    const monthPassRate = calculatePassRate(monthPassedSessions, monthFailedSessions);

    const mostRunLessonMonthly = await getMostRunLesson(monthStart, monthEnd);

    const lessonDistributionMonthly = await getLessonDistributionData(monthStart, monthEnd);

    return (
        <Grid2 container columns={30} spacing={2}>
            <Grid2 size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h4">{getMonth(numMonth)}, {numYear} Statistics</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Sessions</Typography>
                        <Typography variant="h4">{sessions.length}</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
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
            </Grid2>
            <Grid2
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Sessions Passed</Typography>
                        <Typography variant="h4">{monthPassedSessions}</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Sessions Failed</Typography>
                        <Typography variant="h4">{monthFailedSessions}</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
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
            </Grid2>
            <Grid2
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography gutterBottom>Most Run Session</Typography>
                        {mostRunLessonMonthly.lessonIdentifier ? (
                            <Chip
                                label={`${mostRunLessonMonthly.lessonIdentifier} (${mostRunLessonMonthly.count} times)`}
                                color="info"
                                variant="filled"
                                size="medium"
                            />
                        ) : (
                            <Typography variant="body2">N/A</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid2>
            {top3Trainers.map((trainer, idx) => (
                <Grid2
                    key={trainer.user.id}
                    size={{
                        xs: 30,
                        md: 10
                    }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ mb: 2 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography
                                        variant="h5">{idx + 1} - {trainer.user.preferredName || `${trainer.user.firstName} ${trainer.user.lastName}`}</Typography>
                                    <Tooltip title="View Training Statistics for this instructor">
                                        <Link href={`/training/staff/${trainer.user.cid}`}>
                                            <IconButton size="large">
                                                <StackedLineChart fontSize="large" />
                                            </IconButton>
                                        </Link>
                                    </Tooltip>
                                </Stack>
                                <Typography variant="body1">{trainer.user.cid}</Typography>
                            </Box>
                            <Typography variant="h6">{trainer.hours.toPrecision(3)} hours</Typography>
                        </CardContent>
                    </Card>
                </Grid2>
            ))}
            <Grid2 size={30}>
                <Card>
                    <CardContent>
                        {lessonDistributionMonthly.length > 0 ? (
                            <LessonDistributionGraph data={lessonDistributionMonthly} />
                        ) : (
                            <Typography variant="body2" sx={{ mt: 2 }}>No lesson data available for this month.</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid2>

        </Grid2>
    )
}