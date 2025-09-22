import React from 'react';
import prisma from "@/lib/db";
import {getMonth} from "@/lib/date";
import {Card, CardContent, Grid2, Typography, Chip} from "@mui/material";
import {getRating} from "@/lib/vatsim";
import {notFound} from "next/navigation";
import {
    getTrainerSessionsInMonth,
    getTrainerPassedSessionsCountInMonth,
    getTrainerFailedSessionsCountInMonth,
    calculatePassRate, getMostRunLesson, endOfMonthUTC, startOfMonthUTC, getLessonDistributionData
} from "@/actions/trainingStats";
import LessonDistributionGraph from "@/components/TrainingStatistics/LessonDistributionGraph";

export default async function Page(props: { params: Promise<{ year: string, month: string, cid: string }> }) {
    const params = await props.params;

    const {year, month, cid} = params;

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

    const trainer = await prisma.user.findUnique({
        where: { cid: cid },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            preferredName: true,
            cid: true,
            rating: true,
        },
    });

    if (!trainer) {
        notFound();
    }

    const sessions = await getTrainerSessionsInMonth(year, month, cid);

    const totalHours = sessions.reduce((sum, session) => {
        const duration = (session.end.getTime() - session.start.getTime()) / (1000 * 60 * 60);
        return sum + duration;
    }, 0).toFixed(3);

    const trainerPassedSessions = await getTrainerPassedSessionsCountInMonth(numYear, numMonth, cid);
    const trainerFailedSessions = await getTrainerFailedSessionsCountInMonth(numYear, numMonth, cid);

    const trainerMonthPassRate = calculatePassRate(trainerPassedSessions, trainerFailedSessions);

    const trainerMonthStart = startOfMonthUTC(numYear, numMonth);
    const trainerMonthEnd = endOfMonthUTC(numYear, numMonth);
    const mostRunLessonTrainerMonthly = await getMostRunLesson(trainerMonthStart, trainerMonthEnd, trainer.id);

    const lessonDistributionTrainerMonthly = await getLessonDistributionData(trainerMonthStart, trainerMonthEnd, trainer.id);

    return (
        <Grid2 container columns={30} spacing={2}>
            <Grid2 size={30}>
                <Card>
                    <CardContent>
                        <Typography
                            variant="h5">{trainer.preferredName || `${trainer.firstName} ${trainer.lastName}`}</Typography>
                        <Typography
                            variant="body2">{trainer.preferredName && `${trainer.firstName} ${trainer.lastName}`}</Typography>
                        <Typography>{getRating(trainer.rating)} • {trainer.cid}</Typography>
                        <Typography>{parseInt(month) >= 0 && `${getMonth(parseInt(month))}, `}{year} Statistics</Typography>
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
                        <Typography variant="h4">{trainerPassedSessions}</Typography>
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
                        <Typography>Session Failed</Typography>
                        <Typography variant="h4">{trainerFailedSessions}</Typography>
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
                            label={`${trainerMonthPassRate.percentage}%`}
                            color={trainerMonthPassRate.color}
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
                        {mostRunLessonTrainerMonthly.lessonIdentifier ? (
                            <Chip
                                label={`${mostRunLessonTrainerMonthly.lessonIdentifier} (${mostRunLessonTrainerMonthly.count} times)`}
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
            <Grid2 size={30}>
                <Card>
                    <CardContent>
                        {lessonDistributionTrainerMonthly.length > 0 ? (
                            <LessonDistributionGraph data={lessonDistributionTrainerMonthly} />
                        ) : (
                            <Typography variant="body2" sx={{ mt: 2 }}>No lesson data available for this instructor in this month.</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid2>
        </Grid2>
    )
}