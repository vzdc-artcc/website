'use server';

import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {
    Lesson,
    Prisma,
    TrainingProgression,
    TrainingProgressionStep,
    TrainingSession,
    TrainingTicket
} from "@/generated/prisma/client";
import prisma from "@/lib/db";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";
import {User} from "next-auth";
import {sendProgressionAssignedEmail, sendProgressionRemovedEmail} from "@/actions/mail/progression";

export const setProgressionAssignment = async (id: string, progressionId: string) => {
    const user = await prisma.user.update({
        where: {
            id,
        },
        data: {
            trainingProgression: {
                connect: {
                    id: progressionId,
                },
            },
        },
        include: {
            trainingProgression: true,
        },
    });

    await log("UPDATE", "TRAINING_PROGRESSION_ASSIGNMENT", `Assigned training progression ${user.trainingProgression?.name} to ${user.firstName} ${user.lastName} (${user.cid})`);

    sendProgressionAssignedEmail(user as User, user.trainingProgression as TrainingProgression).catch(console.error);

    revalidatePath('/training/progressions/assignments', 'layout');
}

export const fetchProgressionAssignments = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {

    const orderBy: Prisma.UserOrderByWithRelationInput = {};

    if (sort.length > 0) {
        const sortModel = sort[0];
        if (sortModel.field === 'trainingProgression') {
            orderBy.trainingProgression = {
                name: sortModel.sort === 'asc' ? 'asc' : 'desc',
            };
        }
    }


    return prisma.$transaction([
        prisma.user.count({
            where: getWhere(filter),
        }),
        prisma.user.findMany({
            orderBy,
            where: getWhere(filter),
            include: {
                trainingProgression: true,
            },
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
        }),
    ]);
}

const getWhere = (filter?: GridFilterItem): Prisma.UserWhereInput => {
    if (!filter) return {
        trainingProgression: {
            isNot: null,
        },
    };

    switch (filter.field) {
        case 'student':
            return {
                trainingProgression: {
                    isNot: null,
                },
                OR: [
                    {
                        cid: {
                            [filter.operator]: filter.value as string,
                            mode: 'insensitive',
                        }
                    },
                    {
                        fullName: {
                            [filter.operator]: filter.value as string,
                            mode: 'insensitive',
                        }
                    },
                ],
            };
        case 'progression':
            return {
                trainingProgression: {
                    name: {
                        [filter.operator]: filter.value as string,
                        mode: 'insensitive',
                    },
                },
            };
        default:
            return {
                trainingProgression: {
                    isNot: null,
                },
            };
    }
}

export const deleteProgressionAssignment = async (id: string) => {
    const user = await prisma.user.update({
        where: {
            id,
        },
        data: {
            trainingProgression: {
                disconnect: true,
            },
        },
    });

    await log("DELETE", "TRAINING_PROGRESSION_ASSIGNMENT", `Deleted training progression assignment for ${user.firstName} ${user.lastName} (${user.cid})`);

    sendProgressionRemovedEmail(user as User).catch(console.error);

    revalidatePath('/training/progressions/assignments', 'layout');
}

export const getProgressionStatus = async (id: string) => {

    const user = await prisma.user.findUnique({
        where: {
            id,
        },
        include: {
            trainingProgression: {
                include: {
                    steps: {
                        include: {
                            lesson: true,
                        },
                        orderBy: {
                            order: 'asc',
                        },
                    },
                },
            },
        },
    });

    if (!user?.trainingProgression) return [];

    const steps = user.trainingProgression.steps;

    const status: TrainingProgressionStepStatus[] = [];

    for (const step of steps) {
        const progression = user.trainingProgression;
        const lesson = step.lesson;

        const trainingTicket = await prisma.trainingTicket.findFirst({
            where: {
                lessonId: lesson.id,
                session: {
                    studentId: id,
                },
            },
            include: {
                session: true,
            },
            orderBy: {
                session: {
                    end: 'desc',
                },
            },
        });

        status.push({
            step,
            progression,
            lesson,
            trainingTicket: trainingTicket as TrainingTicket,
            trainingSession: trainingTicket?.session,
            passed: !!trainingTicket?.passed,
        });
    }

    return status;
}

export type TrainingProgressionStepStatus = {
    step: TrainingProgressionStep,
    progression: TrainingProgression,
    lesson: Lesson,
    trainingTicket?: TrainingTicket,
    trainingSession?: TrainingSession,
    passed: boolean,
}

export const assignNextProgressionOrRemove = async (userId: string, currentProgression: TrainingProgression, userInitiated?: boolean) => {

    const status = await getProgressionStatus(userId);

    if (status.filter(step => !step.step.optional && !step.passed).length > 0) {
        return;
    }

    const user = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            trainingProgressionId: currentProgression.nextProgressionId || null,
        },
        include: {
            trainingProgression: true,
        },
    });

    if (user.trainingProgression) {
        if (userInitiated) {
            await log("UPDATE", "TRAINING_PROGRESSION_ASSIGNMENT", `User forced assigned next progression ${user.trainingProgression.name} to themselves after passing all required training sessions in ${currentProgression.name}`)
        } else {
            await log("UPDATE", "TRAINING_PROGRESSION_ASSIGNMENT", `Automatically assigned next progression ${user.trainingProgression.name} to ${user.firstName} ${user.lastName} (${user.cid}) after passing final required training session in ${currentProgression.name}`)
        }
        sendProgressionAssignedEmail(user as User, user.trainingProgression).catch(console.error);
    } else {
        sendProgressionRemovedEmail(user as User).catch(console.error);
        await log("DELETE", "TRAINING_PROGRESSION_ASSIGNMENT", `Removed progression ${currentProgression.name} from ${user.firstName} ${user.lastName} (${user.cid}) upon passing final required training session.`)
    }

    revalidatePath('/profile/overview');
}