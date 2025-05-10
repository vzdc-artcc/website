'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import {revalidatePath} from "next/cache";
import {log} from "@/actions/log";
import {formatZuluDate} from "@/lib/date";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {Prisma} from "@prisma/client";
import {
    sendTrainingAppointmentCanceledEmail,
    sendTrainingAppointmentCancelledTrainerEmail,
    sendTrainingAppointmentScheduledEmail,
    sendTrainingAppointmentUpdatedEmail
} from "@/actions/mail/trainingAppointment";

export const fetchTrainingAppointments = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.TrainingAppointmentOrderByWithRelationInput = {};
    if (sort.length > 0) {
        orderBy[sort[0].field as keyof Prisma.TrainingAppointmentOrderByWithRelationInput] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.trainingAppointment.count({
            where: getWhere(filter),
        }),
        prisma.trainingAppointment.findMany({
            orderBy,
            where: getWhere(filter),
            include: {
                student: true,
                trainer: true,
                lessons: true,
            },
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
        })
    ]);
}

const getWhere = (filter?: GridFilterItem): Prisma.TrainingAppointmentWhereInput => {
    if (!filter) {
        return {};
    }

    switch (filter.field) {
        case 'student':
            return {
                student: {
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
                },
            };
        case 'trainer':
            return {
                trainer: {
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
                },
            };
        case 'lessons':
            return {
                lessons: {
                    some: {
                        identifier: {
                            [filter.operator]: filter.value,
                            mode: 'insensitive',
                        }
                    }
                }
            };
        default:
            return {};
    }
}

export const createOrUpdateTrainingAppointment = async (studentId: string, start: string, lessonIds: string[], id?: string) => {

    const trainer = await getServerSession(authOptions);
    const trainerId = trainer?.user.id;

    if (!trainer || !trainerId) {
        return {errors: [{message: 'User not authenticated'}]};
    }

    const isAtLeastOneHourFromNow = (date: Date) => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        return date >= now || !!id;
    }

    const trainingAppointmentZ = z.object({
        id: z.string().optional(),
        studentId: z.string().min(1, {message: "Student is required"}),
        start: z.date({required_error: 'Start date is required'}).refine(isAtLeastOneHourFromNow, {message: "Start date must be at least one hour from now"}),
        lessonIds: z.array(z.string()).min(1, {message: "At least one lesson is required"}).max(5, {message: "A maximum of 5 lessons is allowed"}),
    });

    const result = trainingAppointmentZ.safeParse({
        id,
        studentId,
        start: new Date(start),
        lessonIds,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    if (result.data.id) {
        const oldTA = await prisma.trainingAppointment.findUnique({
            where: {
                id: result.data.id,
            },
            include: {
                lessons: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!oldTA) {
            return {errors: [{message: 'Training appointment not found'}]};
        }

        const ta = await prisma.trainingAppointment.update({
            data: {
                start: result.data.start,
                lessons: {
                    connect: result.data.lessonIds.map((lessonId) => ({id: lessonId})),
                },
                preparationCompleted: (!oldTA.lessons.every((lesson) => result.data.lessonIds.includes(lesson.id)) || result.data.lessonIds.length !== oldTA.lessons.length) ? false : oldTA.preparationCompleted,
                environment: null,
                doubleBooking: false,
            },
            where: {
                id: result.data.id,
            },
            include: {
                student: true,
                lessons: true,
            },
        });

        await log("UPDATE", "TRAINING_APPOINTMENT", `Updated training appointment with ${ta.student.fullName} on ${formatZuluDate(ta.start)}`);

        sendTrainingAppointmentUpdatedEmail(ta, ta.student as User, trainer.user, ta.lessons.map(l => l.duration).reduce((a, c) => a + c, 0)).then();
    } else {
        const ta = await prisma.trainingAppointment.create({
            data: {
                trainerId,
                studentId: result.data.studentId,
                start: result.data.start,
                lessons: {
                    connect: result.data.lessonIds.map((lessonId) => ({id: lessonId})),
                },
            },
            include: {
                student: true,
                lessons: true,
            },
        });

        await log("CREATE", "TRAINING_APPOINTMENT", `Created training appointment with ${ta.student.fullName} on ${formatZuluDate(ta.start)}`);

        sendTrainingAppointmentScheduledEmail(ta, ta.student as User, trainer.user, ta.lessons.map(l => l.duration).reduce((a, c) => a + c, 0)).then();
    }

    revalidatePath('/training/your-students');
    revalidatePath(`/training/appointments`);
    revalidatePath(`/training/calendar`);
    revalidatePath(`/profile/overview`);

    return {};
}

export const deleteTrainingAppointment = async (id: string, fromAdmin?: boolean) => {
    const ta = await prisma.trainingAppointment.delete({
        where: {
            id,
        },
        include: {
            student: true,
            trainer: true,
        },
    });

    revalidatePath('/training/your-students');
    revalidatePath(`/training/appointments`);
    revalidatePath(`/training/calendar`);
    revalidatePath(`/profile/overview`);

    await log("DELETE", "TRAINING_APPOINTMENT", `Deleted training appointment with ${ta.student.fullName} on ${formatZuluDate(ta.start)}`)

    sendTrainingAppointmentCanceledEmail(ta, ta.student as User, ta.trainer as User).then();
    if (fromAdmin) {
        sendTrainingAppointmentCancelledTrainerEmail(ta, ta.student as User, ta.trainer as User).then();
    }
}

export const completePreparation = async (id: string) => {
    const session = await getServerSession(authOptions);

    if (!session?.user.id) {
        return {errors: [{message: 'User not authenticated'}]};
    }

    await prisma.trainingAppointment.update({
        where: {
            id,
            studentId: session.user.id,
        },
        data: {
            preparationCompleted: true,
        },
    });

    revalidatePath('/training/your-students');
    revalidatePath(`/training/appointments`);
    revalidatePath(`/training/calendar`);
    revalidatePath(`/profile/overview`);
}