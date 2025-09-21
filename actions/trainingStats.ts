import prisma from '@/lib/db';

interface TrainingSessionsPerMonthData {
    month: string;
    sessions: number;
}

interface LessonDistributionData {
    lesson: string;
    passed: number;
    failed: number;
}

export async function getPerMonthData(): Promise<
    TrainingSessionsPerMonthData[]
> {
    const trainingSessions = await prisma.trainingSession.findMany({
        select: {
            start: true,
        },
        orderBy: {
            start: 'asc',
        },
    });

    const sessionCounts: { [key: string]: number } = {};

    trainingSessions.forEach((session) => {
        const date = new Date(session.start);
        const month = date.toLocaleString('en-US', {
            month: 'short',
            year: 'numeric',
        });
        sessionCounts[month] = (sessionCounts[month] || 0) + 1;
    });

    const sortedMonths = Object.keys(sessionCounts).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA.getTime() - dateB.getTime();
    });

    const perMonthData = sortedMonths.map((month) => ({
        month: month,
        sessions: sessionCounts[month],
    }));

    return perMonthData;

}

export async function getLessonDistributionData(): Promise<
    LessonDistributionData[]
> {
    const trainingTickets = await prisma.trainingTicket.findMany({
        select: {
            lesson: {
                select: {
                    identifier: true,
                },
            },
            passed: true,
        },
        orderBy: {
            lesson: {
                identifier: 'asc',
            }
        }
    });

    const lessonStats: {
        [key: string]: { passed: number; failed: number };
    } = {};
    trainingTickets.forEach((ticket) => {
        const lessonIdentifier = ticket.lesson.identifier;
        if (!lessonStats[lessonIdentifier]) {
            lessonStats[lessonIdentifier] = { passed: 0, failed: 0 };
        }
        if (ticket.passed) {
            lessonStats[lessonIdentifier].passed++;
        } else {
            lessonStats[lessonIdentifier].failed++;
        }
    });

    const lessonDistributionData: LessonDistributionData[] = Object.keys(
        lessonStats,
    ).map((lessonIdentifier) => ({
        lesson: lessonIdentifier,
        passed: lessonStats[lessonIdentifier].passed,
        failed: lessonStats[lessonIdentifier].failed,
    }));

    return lessonDistributionData;
}