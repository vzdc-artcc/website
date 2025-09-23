import prisma from "@/lib/db";

export function startOfMonthUTC(year: number, monthZero: number) {
    return new Date(Date.UTC(year, monthZero, 1));
}

export function endOfMonthUTC(year: number, monthZero: number) {
    return new Date(Date.UTC(year, monthZero + 1, 0, 23, 59, 59, 999));
}

export function startOfYearUTC(year: number) {
    return new Date(Date.UTC(year, 0, 1));
}

export function endOfYearUTC(year: number) {
    return new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
}

type PassRateResult = {
    percentage: number;
    color: 'success' | 'warning' | 'error' | 'default';
    totalEvaluated: number;
};

export function calculatePassRate(passedCount: number, failedCount: number): PassRateResult {
    const totalEvaluated = passedCount + failedCount;
    let percentage = 0;
    let color: PassRateResult['color'] = 'default';

    if (totalEvaluated > 0) {
        percentage = (passedCount / totalEvaluated) * 100;

        if (percentage >= 80) {
            color = 'success';
        } else if (percentage >= 50) {
            color = 'warning';
        } else {
            color = 'error';
        }
    }

    return {
        percentage: parseFloat(percentage.toFixed(2)),
        color,
        totalEvaluated,
    };
}

export async function getAllSessionsInMonth(year: string, month: string) {

    const startOfMonth = new Date(Number(year), Number(month), 1);
    const endOfMonth = new Date(Number(year), Number(month) + 1, 0);

    const sessions = await prisma.trainingSession.findMany({
        where: {
            start: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        }
    });

    return sessions;
}

export async function getAllTrainingHours() {
    const trainingSessions = await prisma.trainingSession.findMany({
        select: {
            start: true,
            end: true,
        },
    });

    let totalHours = 0;
    trainingSessions.forEach((session) => {
        const duration =
            (session.end.getTime() - session.start.getTime()) / (1000 * 60 * 60);
        totalHours += duration;
    });

    return totalHours;
}

export const getTopTrainingStaffByHours = async (limit: number, startDate: Date, endDate: Date) => {
    const trainingSessions = await prisma.trainingSession.findMany({
        where: {
            start: {
                gte: startDate,
            },
            end: {
                lt: endDate,
            },
        },
        include: {
            instructor: {
                select: {
                    id: true,
                    preferredName: true,
                    firstName: true,
                    lastName: true,
                    cid: true,
                },
            },
        },
    });

    const staffHours: {
        [key: string]: {
            user: {
                id: string;
                preferredName: string | null;
                firstName: string | null;
                lastName: string | null;
                cid: string;
            };
            hours: number;
        };
    } = {};

    trainingSessions.forEach((session) => {
        const instructorId = session.instructor.id;
        const duration =
            (session.end.getTime() - session.start.getTime()) / (1000 * 60 * 60);

        if (!staffHours[instructorId]) {
            staffHours[instructorId] = {
                user: session.instructor,
                hours: 0,
            };
        }
        staffHours[instructorId].hours += duration;
    });

    const sortedStaff = Object.values(staffHours).sort(
        (a, b) => b.hours - a.hours,
    );

    return sortedStaff.slice(0, limit);
};

export async function getPassedSessionsCountInMonth(
    year: number,
    monthZero: number
) {
    const start = startOfMonthUTC(year, monthZero);
    const end = startOfMonthUTC(year, monthZero + 1);

    return prisma.trainingSession.count({
        where: {
            start: { gte: start },
            end: { lt: end },
            tickets: { every: { passed: true } },
        },
    });
}

export async function getFailedSessionsCountInMonth(
    year: number,
    monthZero: number
) {
    const start = startOfMonthUTC(year, monthZero);
    const end = startOfMonthUTC(year, monthZero + 1);

    return prisma.trainingSession.count({
        where: {
            start: { gte: start },
            end: { lt: end },
            tickets: { some: { passed: false } },
        },
    });
}

export async function getTrainerSessionsInMonth(year: string, month: string, cid: string) {
    const numYear = Number(year);
    const numMonth = Number(month);

    const user = await prisma.user.findUnique({
        where: { cid: cid },
        select: { id: true },
    });

    if (!user) {
        return [];
    }

    const startOfMonth = new Date(numYear, numMonth, 1);
    const endOfMonth = new Date(numYear, numMonth + 1, 0, 23, 59, 59, 999);


    const sessions = await prisma.trainingSession.findMany({
        where: {
            instructorId: user.id,
            start: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        include: {
            student: {
                select: {
                    id: true,
                    cid: true,
                    firstName: true,
                    lastName: true,
                    preferredName: true,
                    rating: true,
                }
            }
        }
    });

    return sessions;
}

export async function getTrainerPassedSessionsCountInMonth(year: number, monthZero: number, cid: string) {

    const user = await prisma.user.findUnique({
        where: { cid: cid },
        select: { id: true },
    });

    if (!user) {
        return 0;
    }

    const start = startOfMonthUTC(year, monthZero);
    const end = endOfMonthUTC(year, monthZero);

    return prisma.trainingSession.count({
        where: {
            instructorId: user.id,
            start: { gte: start },
            end: { lt: end },
            tickets: { every: { passed: true } },
        },
    });
}

export async function getTrainerFailedSessionsCountInMonth(year: number, monthZero: number, cid: string) {

    const user = await prisma.user.findUnique({
        where: { cid: cid },
        select: { id: true },
    });

    if (!user) {
        return 0;
    }

    const start = startOfMonthUTC(year, monthZero);
    const end = endOfMonthUTC(year, monthZero);

    return prisma.trainingSession.count({
        where: {
            instructorId: user.id,
            start: { gte: start },
            end: { lt: end },
            tickets: { some: { passed: false } },
        },
    });
}

export async function getAllSessionsInYear(year: number) {
    const start = startOfYearUTC(year);
    const end = endOfYearUTC(year);

    const sessions = await prisma.trainingSession.findMany({
        where: {
            start: {
                gte: start,
                lte: end
            }
        },
        include: {
            instructor: { select: { id: true, firstName: true, lastName: true, preferredName: true, cid: true } },
            student: { select: { id: true, firstName: true, lastName: true, preferredName: true, cid: true } }
        }
    });

    return sessions;
}

export async function getPassedSessionsCountInYear(year: number) {
    const start = startOfYearUTC(year);
    const end = endOfYearUTC(year);

    return prisma.trainingSession.count({
        where: {
            start: { gte: start },
            end: { lt: end },
            tickets: { every: { passed: true } },
        },
    });
}

export async function getFailedSessionsCountInYear(year: number) {
    const start = startOfYearUTC(year);
    const end = endOfYearUTC(year);

    return prisma.trainingSession.count({
        where: {
            start: { gte: start },
            end: { lt: end },
            tickets: { some: { passed: false } },
        },
    });
}

export async function getMostRunLesson(
    startDate: Date,
    endDate: Date,
    instructorId?: string
): Promise<{ lessonIdentifier: string | null; count: number }> {
    const whereClause: any = {
        session: {
            start: {
                gte: startDate,
            },
            end: {
                lt: endDate,
            },
        },
    };

    if (instructorId) {
        whereClause.session.instructorId = instructorId;
    }

    const trainingTickets = await prisma.trainingTicket.findMany({
        where: whereClause,
        select: {
            lessonId: true,
            lesson: {
                select: {
                    identifier: true,
                },
            },
        },
    });

    if (trainingTickets.length === 0) {
        return { lessonIdentifier: null, count: 0 };
    }

    const lessonCounts: { [identifier: string]: number } = {};
    trainingTickets.forEach(ticket => {
        if (ticket.lesson && ticket.lesson.identifier) {
            lessonCounts[ticket.lesson.identifier] = (lessonCounts[ticket.lesson.identifier] || 0) + 1;
        }
    });

    let mostRunLessonIdentifier: string | null = null;
    let maxCount = 0;

    for (const identifier in lessonCounts) {
        if (lessonCounts[identifier] > maxCount) {
            maxCount = lessonCounts[identifier];
            mostRunLessonIdentifier = identifier;
        }
    }

    return { lessonIdentifier: mostRunLessonIdentifier, count: maxCount };
}

export async function getTrainerMonthlySessionCountsForYear(year: number, instructorId: string): Promise<{ month: string; sessions: number }[]> {
    const data = [];
    for (let i = 0; i < 12; i++) {
        const start = startOfMonthUTC(year, i);
        const end = endOfMonthUTC(year, i);

        const sessionCount = await prisma.trainingSession.count({
            where: {
                instructorId: instructorId,
                start: { gte: start },
                end: { lt: end },
            },
        });

        const monthName = new Date(year, i).toLocaleString('default', { month: 'short' }); // e.g., 'Jan', 'Feb'
        data.push({
            month: monthName,
            sessions: sessionCount,
        });
    }
    return data;
}

export async function getLessonDistributionData(
    startDate: Date,
    endDate: Date,
    instructorId?: string
): Promise<{ lesson: string; passed: number; failed: number }[]> {
    const whereClause: any = {
        session: {
            start: {
                gte: startDate,
            },
            end: {
                lt: endDate,
            },
        },
    };

    if (instructorId) {
        whereClause.session.instructorId = instructorId;
    }

    const tickets = await prisma.trainingTicket.findMany({
        where: whereClause,
        select: {
            passed: true,
            lesson: {
                select: {
                    identifier: true,
                    name: true,
                },
            },
        },
    });

    if (tickets.length === 0) {
        return [];
    }

    const distributionMap: { [lessonIdentifier: string]: { passed: number; failed: number; lessonName: string } } = {};

    tickets.forEach(ticket => {

        const rawIdentifier = ticket.lesson?.identifier || ticket.lesson?.name;
        const identifier = rawIdentifier || 'Unknown Lesson'; // Fallback for robustness

        if (!distributionMap[identifier]) {
            distributionMap[identifier] = { passed: 0, failed: 0, lessonName: identifier };
        }
        if (ticket.passed) {
            distributionMap[identifier].passed++;
        } else {
            distributionMap[identifier].failed++;
        }
    });

    const data: { lesson: string; passed: number; failed: number }[] = Object.values(distributionMap).map(item => ({
        lesson: item.lessonName,
        passed: item.passed,
        failed: item.failed,
    }));

    data.sort((a, b) => a.lesson.localeCompare(b.lesson));

    return data;
}

export async function getTrainerSessionsInYear(year: number, instructorId: string) {
    const start = startOfYearUTC(year);
    const end = endOfYearUTC(year);

    const sessions = await prisma.trainingSession.findMany({
        where: {
            instructorId: instructorId, // Filter by trainer's ID
            start: {
                gte: start,
                lt: end
            }
        },
        include: {
            instructor: { select: { id: true, firstName: true, lastName: true, preferredName: true, cid: true } },
            student: { select: { id: true, firstName: true, lastName: true, preferredName: true, cid: true } }
        }
    });

    return sessions;
}

export async function getTrainerPassedSessionsCountInYear(year: number, instructorId: string) {
    const start = startOfYearUTC(year);
    const end = endOfYearUTC(year);

    return prisma.trainingSession.count({
        where: {
            instructorId: instructorId, // Filter by trainer's ID
            start: { gte: start },
            end: { lt: end },
            tickets: { every: { passed: true } },
        },
    });
}

export async function getTrainerFailedSessionsCountInYear(year: number, instructorId: string) {
    const start = startOfYearUTC(year);
    const end = endOfYearUTC(year);

    return prisma.trainingSession.count({
        where: {
            instructorId: instructorId, // Filter by trainer's ID
            start: { gte: start },
            end: { lt: end },
            tickets: { some: { passed: false } },
        },
    });
}
