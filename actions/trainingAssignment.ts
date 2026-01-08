'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {revalidatePath} from "next/cache";
import {log} from "@/actions/log";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {Prisma} from "@prisma/client";
import {
    sendTrainingAssignmentDeletedEmail,
    sendTrainingAssignmentUpdatedEmail,
    sendTrainingRequestFulfilledEmail
} from "@/actions/mail/training";
import {User} from "next-auth";

const BOT_API_BASE_URL = process.env.BOT_API_BASE_URL || 'http://localhost:5500';
const BOT_API_SECRET_KEY = process.env.BOT_API_SECRET_KEY || '1234';
const {DISCORD_GUILD_ID} = process.env;

export const createDiscordTrainingChannel = async (student: User, primaryTrainer: User, otherTrainers: User[]) => {
    try {
        const res = await fetch(`${BOT_API_BASE_URL}/create_training_channel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': `${BOT_API_SECRET_KEY}`,
            },
            body: JSON.stringify({
                guild_id: DISCORD_GUILD_ID,
                student,
                primaryTrainer,
                otherTrainers,
            }),
        });

        if (res.ok) {
            await log("CREATE", "DISCORD_CHANNEL_UPDATE", `Created Discord training channel for ${student.fullName} (${student.cid}) with primary trainer ${primaryTrainer.fullName} (${primaryTrainer.cid}) and other trainers ${otherTrainers.map(t => `${t.fullName} (${t.cid})`).join(', ')}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error("Error creating Discord training channel:", error);
        return false;
    }
}

export const expressInterest = async (requestId: string, userId: string) => {
    const request = await prisma.trainingAssignmentRequest.update({
        where: {
            id: requestId,
        },
        data: {
            interestedTrainers: {
                connect: {
                    id: userId,
                },
            },
        },
        include: {
            student: true,
        },
    });

    await log("UPDATE", "TRAINING_ASSIGNMENT_REQUEST", `Expressed interest for ${request.student.fullName}'s (${request.student.cid}) training request`);

    revalidatePath(`/training/requests/${requestId}`);
}

export const removeInterest = async (requestId: string, userId: string) => {
    const request = await prisma.trainingAssignmentRequest.update({
        where: {
            id: requestId,
        },
        data: {
            interestedTrainers: {
                disconnect: {
                    id: userId,
                },
            },
        },
        include: {
            student: true,
        },
    });

    await log("UPDATE", "TRAINING_ASSIGNMENT_REQUEST", `Removed interest for ${request.student.fullName}'s (${request.student.cid}) training request`);

    revalidatePath(`/training/requests/${requestId}`);
}

export const deleteTrainingAssignment = async (id: string) => {
    const request = await prisma.trainingAssignment.delete({
        where: {
            id,
        },
        include: {
            student: true,
            primaryTrainer: true,
            otherTrainers: true,
        },
    });

    await log("DELETE", "TRAINING_ASSIGNMENT", `Deleted training request for ${request.student.fullName} (${request.student.cid})`);

    sendTrainingAssignmentDeletedEmail(request.student as User, [request.primaryTrainer as User, ...request.otherTrainers as User[]]).then();
    revalidatePath('/training/requests');
}

export const saveTrainingAssignment = async (formData: FormData) => {

    const assignmentZ = z.object({
        id: z.string().optional(),
        trainingRequestId: z.string().optional(),
        student: z.string().trim().min(1, 'Student is required'),
        primaryTrainer: z.string().trim().min(1, 'Primary trainer is required'),
        otherTrainers: z.array(z.string().trim().min(1, 'Other trainer(s) are required.')).min(1, 'At least one additional trainer is required'),
    });

    const result = assignmentZ.safeParse({
        id: formData.get('id'),
        trainingRequestId: formData.get('trainingRequestId'),
        student: formData.get('student'),
        primaryTrainer: formData.get('primaryTrainer'),
        otherTrainers: (formData.get('otherTrainers') as string || '').split(','),
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const {id, trainingRequestId, student, primaryTrainer, otherTrainers} = result.data;

    const oldAssignment = await prisma.trainingAssignment.findUnique({
        where: {
            id: id || '',
        },
        include: {
            student: true,
            primaryTrainer: true,
            otherTrainers: true,
        },
    });

    const assignment = await prisma.trainingAssignment.upsert({
        where: {
            id: id || '',
        },
        create: {
            student: {
                connect: {
                    id: student,
                },
            },
            primaryTrainer: {
                connect: {
                    id: primaryTrainer,
                },
            },
            otherTrainers: {
                connect: otherTrainers.map((ot) => ({id: ot})),
            },
        },
        update: {
            primaryTrainer: {
                connect: {
                    id: primaryTrainer,
                },
            },
            otherTrainers: {
                set: otherTrainers.map((ot) => ({id: ot})),
            },
        },
        include: {
            student: true,
            primaryTrainer: true,
            otherTrainers: true,
        },
    });

    if (trainingRequestId) {
        await prisma.trainingAssignmentRequest.delete({
            where: {
                id: trainingRequestId,
            },
        });
    }

    if (id) {

        const oldTrainerIds = oldAssignment?.otherTrainers.map(trainer => trainer.id) || [];
        const newTrainerIds = [primaryTrainer, ...otherTrainers];

        const removedTrainers = [oldAssignment?.primaryTrainer, ...(oldAssignment?.otherTrainers || [])].filter(trainer => !newTrainerIds.includes(trainer?.id || '')) || [];
        const addedTrainers = assignment.otherTrainers.filter(trainer => !oldTrainerIds.includes(trainer.id));

        await log("UPDATE", "TRAINING_ASSIGNMENT", `Updated training assignment for ${assignment.student.fullName} (${assignment.student.cid})`);
        sendTrainingAssignmentUpdatedEmail(
            assignment.student as User,
            assignment.primaryTrainer as User,
            removedTrainers as User[],
            addedTrainers as User[],
            oldAssignment?.primaryTrainer.id !== assignment.primaryTrainer.id,
        ).then();
    } else {
        await log("CREATE", "TRAINING_ASSIGNMENT", `Created training assignment for ${assignment.student.fullName} (${assignment.student.cid})`);
        sendTrainingRequestFulfilledEmail(assignment.student as User, assignment.primaryTrainer as User, assignment.otherTrainers as User[]).then();
    }

    revalidatePath('/training/assignments');


    return {assignment};

}

export const fetchTrainingAssignments = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.TrainingAssignmentOrderByWithRelationInput = {};
    if (sort.length > 0 && sort[0].field === 'rating') {
        orderBy['student'] = {
            rating: sort[0].sort === 'asc' ? 'asc' : 'desc',
        };
    } else if (sort.length > 0) {
        const field = sort[0].field as keyof Prisma.TrainingAssignmentOrderByWithRelationInput;
        orderBy[field] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    const where = getWhere(filter);

    return prisma.$transaction([
        prisma.trainingAssignment.count({where}),
        prisma.trainingAssignment.findMany({
            orderBy,
            include: {
                student: {
                    include: {
                        trainingAppointmentStudent: {
                            orderBy: {
                                start: 'asc',
                            },
                            where: {
                                start: {
                                    gte: new Date(),
                                }
                            },
                            include: {
                                trainer: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                                lessons: {
                                    select: {
                                        id: true,
                                        identifier: true,
                                    }
                                },
                            },
                            take: 1,
                        },
                        trainingSessions: {
                            orderBy: {start: 'desc'},
                            take: 1,
                            include: {
                                tickets: {
                                    include: {
                                        lesson: true,
                                    }
                                },
                            },
                        },
                    },
                },
                primaryTrainer: true,
                otherTrainers: true,
            },
            where,
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
        }),
    ]);
};

const getWhere = (filter?: GridFilterItem): Prisma.TrainingAssignmentWhereInput => {
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
                            },
                        },
                        {
                            fullName: {
                                [filter.operator]: filter.value as string,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            };
        case 'cid':
            return {
                student: {
                    cid: {
                        [filter.operator]: filter.value as string,
                        mode: 'insensitive',
                    },
                },
            };
        case 'primaryTrainer':
            return {
                primaryTrainer: {
                    OR: [
                        {
                            cid: {
                                [filter.operator]: filter.value as string,
                                mode: 'insensitive',
                            },
                        },
                        {
                            fullName: {
                                [filter.operator]: filter.value as string,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            };
        case 'otherTrainers':
            return {
                otherTrainers: {
                    some: {
                        OR: [
                            {
                                cid: {
                                    [filter.operator]: filter.value as string,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                fullName: {
                                    [filter.operator]: filter.value as string,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    },
                },
            };
        default:
            return {};
    }
};

export const getPrimaryAndSecondaryStudentNumbers = async (trainerId: string) => {
    const primary = await prisma.trainingAssignment.count({
        where: {
            primaryTrainerId: trainerId,
        },
    });
    const secondary = await prisma.trainingAssignment.count({
        where: {
            otherTrainers: {
                some: {
                    id: trainerId,
                },
            },
        },
    });
    return {primary, secondary};
}
