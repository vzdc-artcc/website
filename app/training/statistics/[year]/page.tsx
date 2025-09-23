import React from 'react';
import {Box, Card, CardContent, Chip, Grid2, Typography} from "@mui/material";
import {
    getAllSessionsInYear,
    getPassedSessionsCountInYear,
    getFailedSessionsCountInYear,
    getTopTrainingStaffByHours,
    endOfYearUTC,
    startOfYearUTC,
    calculatePassRate,
    getMostRunLesson,
    getLessonDistributionData, getMonthlySessionCountsForYear,

} from "@/actions/trainingStats";
import TrainingSessionsByMonthGraph from "@/components/TrainingStatistics/TrainingSessionsByMonthGraph";
import LessonDistributionGraph from "@/components/TrainingStatistics/LessonDistributionGraph";


export default async function Page(props: { params: Promise<{ year: string }> }) {
    const params = await props.params;

    const {year} = params;

    const numYear = parseInt(year);

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

    const sessionsInYear = await getAllSessionsInYear(numYear);
    const totalHoursInYear = sessionsInYear.reduce((sum, session) => {
        const duration = (session.end.getTime() - session.start.getTime()) / (1000 * 60 * 60);
        return sum + duration;
    }, 0).toFixed(3);
    const passedSessionsInYear = await getPassedSessionsCountInYear(numYear);
    const failedSessionsInYear = await getFailedSessionsCountInYear(numYear);

    const yearPassRate = calculatePassRate(passedSessionsInYear, failedSessionsInYear);

    const yearStart = startOfYearUTC(numYear);
    const yearEnd = endOfYearUTC(numYear);
    const top3TrainersYearly = await getTopTrainingStaffByHours(3, yearStart, yearEnd);

    const mostRunLessonYearly = await getMostRunLesson(yearStart, yearEnd);

    const monthlyGraphData = await getMonthlySessionCountsForYear(numYear);

    const lessonDistributionYearly = await getLessonDistributionData(yearStart, yearEnd);

    return (
        <Grid2 container columns={30} spacing={2}>
            <Grid2 size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h4">Training Statistics</Typography>
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
                        <Typography variant="h4">{sessionsInYear.length}</Typography>
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
                        <Typography variant="h4">{totalHoursInYear}</Typography>
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
                        <Typography variant="h4">{passedSessionsInYear}</Typography>
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
                        <Typography variant="h4">{failedSessionsInYear}</Typography>
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
                            label={`${yearPassRate.percentage}%`}
                            color={yearPassRate.color}
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
                        {mostRunLessonYearly.lessonIdentifier ? (
                            <Chip
                                label={`${mostRunLessonYearly.lessonIdentifier} (${mostRunLessonYearly.count} times)`}
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
            {top3TrainersYearly.map((trainer, idx) => (
                <Grid2
                    key={trainer.user.id}
                    size={{
                        xs: 30,
                        md: 10
                    }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ mb: 2 }}>
                                    <Typography
                                        variant="h5">{idx + 1} - {trainer.user.preferredName || `${trainer.user.firstName} ${trainer.user.lastName}`}
                                    </Typography>
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
                        <TrainingSessionsByMonthGraph data={monthlyGraphData} />
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 size={30}>
                <Card>
                    <CardContent>
                        {lessonDistributionYearly.length > 0 ? (
                            <LessonDistributionGraph data={lessonDistributionYearly} />
                        ) : (
                            <Typography variant="body2" sx={{ mt: 2 }}>No lesson data available for this year.</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid2>
        </Grid2>
    )
}