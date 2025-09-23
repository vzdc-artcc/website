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
    calculatePassRate, getMostRunLesson,
    endOfMonthUTC,
    startOfMonthUTC,
    getLessonDistributionData,
    startOfYearUTC,
    endOfYearUTC,
    getTrainerSessionsInYear,
    getTrainerPassedSessionsCountInYear,
    getTrainerFailedSessionsCountInYear,
    getTrainerMonthlySessionCountsForYear
} from "@/actions/trainingStats";
import LessonDistributionGraph from "@/components/TrainingStatistics/LessonDistributionGraph";
import TrainingSessionsByMonthGraph from "@/components/TrainingStatistics/TrainingSessionsByMonthGraph";

export default async function Page(props: { params: Promise<{ year: string, month: string, cid: string }> }) {
    const params = await props.params;

    const {year, month, cid} = params;

    const numYear = parseInt(year);
    const numMonth = month === '-' ? -1 : parseInt(month);

    const trainer = await prisma.user.findUnique({
        where: {cid: cid},
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

    if (isNaN(numYear) || numYear < 2000 || numYear > new Date().getFullYear()) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h4">Invalid Year</Typography>
                    <Typography sx={{mt: 1,}}>Year must be after 2000 and not after this year.</Typography>
                </CardContent>
            </Card>
        );
    }

    if (month !== '-' && (isNaN(numMonth) || numMonth < 0 || numMonth > 11)) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h4">Invalid Month</Typography>
                    <Typography sx={{mt: 1,}}>Month must be within 0-11 range or '-' for all months.</Typography>
                </CardContent>
            </Card>
        );
    }

    if (month === '-') {
        const yearStart = startOfYearUTC(numYear);
        const yearEnd = endOfYearUTC(numYear);

        const sessionsInYear = await getTrainerSessionsInYear(numYear, trainer.id);
        const totalHoursInYear = sessionsInYear.reduce((sum, session) => {
            const duration = (session.end.getTime() - session.start.getTime()) / (1000 * 60 * 60);
            return sum + duration;
        }, 0).toFixed(3);
        const passedSessionsInYear = await getTrainerPassedSessionsCountInYear(numYear, trainer.id);
        const failedSessionsInYear = await getTrainerFailedSessionsCountInYear(numYear, trainer.id);

        const yearPassRate = calculatePassRate(passedSessionsInYear, failedSessionsInYear);

        const mostRunLessonYearly = await getMostRunLesson(yearStart, yearEnd, trainer.id);
        const lessonDistributionYearly = await getLessonDistributionData(yearStart, yearEnd, trainer.id);
        const monthlyTrainerGraphData = await getTrainerMonthlySessionCountsForYear(numYear, trainer.id);


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
                            <Typography>{numYear} Yearly Training Statistics</Typography>
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
                <Grid2 size={30}>
                    <Card>
                        <CardContent>
                            <TrainingSessionsByMonthGraph data={monthlyTrainerGraphData}/>
                        </CardContent>
                    </Card>
                </Grid2>
                <Grid2 size={30}>
                    <Card>
                        <CardContent>
                            {lessonDistributionYearly.length > 0 ? (
                                <LessonDistributionGraph data={lessonDistributionYearly}/>
                            ) : (
                                <Typography variant="body2" sx={{mt: 2}}>No lesson data available for this instructor in
                                    this year.</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2>
        );

    } else {

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
                            <Typography>Sessions Failed</Typography>
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
                                <LessonDistributionGraph data={lessonDistributionTrainerMonthly}/>
                            ) : (
                                <Typography variant="body2" sx={{mt: 2}}>No lesson data available for this instructor in
                                    this month.</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2>
        );
    }
}