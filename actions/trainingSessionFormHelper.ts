'use server';

import prisma from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

export const getAllData = async () => {

    const session = await getServerSession(authOptions);

    const lessons = await prisma.lesson.findMany({
        orderBy: {
            identifier: 'asc',
        },
    });
    const users = await prisma.user.findMany({
        where: {
            controllerStatus: {
                not: 'NONE',
            },
        },
        orderBy: {
            lastName: 'asc',
        }
    });

    const yourStudentIds = await prisma.user.findMany({
        where: {
            trainingAssignmentStudent: {
                OR: [
                    {primaryTrainerId: session?.user.id},
                    {otherTrainers: {some: {id: session?.user.id}}}
                ],
            },
        },
        select: {
            id: true,
        },
    });

    return {lessons, users, yourStudentIds: yourStudentIds.map(u => u.id)};
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
            scores: true,
            lesson: true,
        },
    });
}