'use server';

import prisma from "@/lib/db";

export const getAllData = async () => {

    const lessons = await prisma.lesson.findMany();
    const commonMistakes = await prisma.commonMistake.findMany();
    const users = await prisma.user.findMany();

    return {lessons, commonMistakes, users};
}

export const getCriteriaForLesson = async (lessonId: string) => {
    const criteria = await prisma.lessonRubricCriteria.findMany({
        where: {
            rubric: {
                Lesson: {
                    id: lessonId,
                },
            },
        },
        include: {
            cells: true,
        },
    });

    return {criteria, cells: criteria.map(c => c.cells).flat()};
}

export const getTicketsForSession = async (trainingSessionId: string) => {
    return prisma.trainingTicket.findMany({
        where: {
            sessionId: trainingSessionId,
        },
        include: {
            mistakes: true,
            scores: true,
            lesson: true,
        },
    });
}