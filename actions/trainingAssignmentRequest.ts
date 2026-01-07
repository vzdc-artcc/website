'use server';

import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {Prisma} from "@prisma/client";
import prisma from "@/lib/db";
import {revalidatePath} from "next/cache";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import {log} from "@/actions/log";
import {sendTrainingRequestDeletedEmail} from "@/actions/mail/training";

export const submitTrainingAssignmentRequest = async () => {
    const session = await getServerSession(authOptions);

    if (!session) {
        return {errors: ['You must be logged in to submit a training assignment request.']};
    }

    if (session.user.noRequestTrainingAssignments) {
        return {errors: ['You are not allowed to submit training assignment requests.']};
    }

    const existingRequest = await prisma.trainingAssignmentRequest.findUnique({
        where: {
            studentId: session.user.id,
        },
    });

    if (existingRequest) {
        return {errors: ['You already have a training assignment request pending.']};
    }

    const request = await prisma.trainingAssignmentRequest.create({
        data: {
            studentId: session.user.id,
            submittedAt: new Date(),
        },
    });

    await log("CREATE", "TRAINING_ASSIGNMENT_REQUEST", `Submitted training assignment request`);

    revalidatePath('/profile/overview');
    revalidatePath('/training/requests');

    return {request};
}

export const cancelTrainingAssignmentRequest = async (requestId: string) => {
    const session = await getServerSession(authOptions);

    if (!session) {
        return {errors: ['You must be logged in to cancel a training assignment request.']};
    }

    if (session.user.noRequestTrainingAssignments) {
        return {errors: ['You are not allowed to cancel training assignment requests.  Please contact training staff for assistance.']};
    }

    const request = await prisma.trainingAssignmentRequest.findUnique({
        where: {
            id: requestId,
        },
    });

    if (!request) {
        return {errors: ['The training assignment request you are trying to cancel does not exist.']};
    }

    if (request.studentId !== session.user.id) {
        return {errors: ['You are not allowed to cancel this training assignment request.']};
    }

    await prisma.trainingAssignmentRequest.delete({
        where: {
            id: requestId,
        },
    });

    await log("DELETE", "TRAINING_ASSIGNMENT_REQUEST", `Cancelled training assignment request`);

    revalidatePath('/profile/overview');
    revalidatePath('/training/requests');

    return {request};
}

export const deleteTrainingAssignmentRequest = async (id: string) => {
    const request = await prisma.trainingAssignmentRequest.delete({
        where: {
            id,
        },
        include: {
            student: true,
        }
    });

    await log("DELETE", "TRAINING_ASSIGNMENT_REQUEST", `Deleted training assignment request for ${request.student.fullName} (${request.student.cid})`);

    revalidatePath('/training/requests');

    await sendTrainingRequestDeletedEmail(request.student as User);

    return request;
}

export const fetchRequests = async (
    pagination: GridPaginationModel,
    sort: GridSortModel,
    filter?: GridFilterItem,
    controllerStatus?: 'HOME' | 'VISITOR' | 'NONE'
) => {
    const orderBy: Prisma.TrainingAssignmentRequestOrderByWithRelationInput = {};
    if (sort.length > 0 && sort[0].field === 'submittedAt') {
        orderBy['submittedAt'] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }
    if (sort.length > 0 && sort[0].field === 'rating') {
        orderBy['student'] = {
            rating: sort[0].sort === 'asc' ? 'asc' : 'desc',
        };
    }

    return prisma.$transaction([
        prisma.trainingAssignmentRequest.count({
            where: getWhere(filter, controllerStatus),
        }),
        prisma.trainingAssignmentRequest.findMany({
            where: getWhere(filter, controllerStatus),
            orderBy,
            skip: pagination.page * pagination.pageSize,
            take: pagination.pageSize,
            include: {
                student: {
                    include: {
                        trainingSessions: {
                            orderBy: { start: 'desc' },
                            take: 1,
                            include: {
                                tickets: {
                                    include: {
                                        lesson: true,
                                    },
                                },
                            },
                        },
                    },
                },
                interestedTrainers: true,
            },
        }),
    ]);
};

const getWhere = (filter?: GridFilterItem, controllerStatus?: 'HOME' | 'VISITOR' | 'NONE') => {
    const where: Prisma.TrainingAssignmentRequestWhereInput = {};
    let studentClause: Prisma.UserWhereInput | undefined = undefined;

    if (filter) {
        switch (filter.field) {
            case 'student':
                studentClause = {
                    OR: [
                        { cid: { [filter.operator]: filter.value as string, mode: 'insensitive' } },
                        { fullName: { [filter.operator]: filter.value as string, mode: 'insensitive' } },
                    ],
                };
                break;
            case 'cid':
                studentClause = {
                    cid: { [filter.operator]: filter.value as string, mode: 'insensitive' },
                };
                break;
            case 'interestedTrainers':
                where['interestedTrainers'] = {
                    some: {
                        OR: [
                            { cid: { [filter.operator]: filter.value as string, mode: 'insensitive' } },
                            { fullName: { [filter.operator]: filter.value as string, mode: 'insensitive' } },
                        ],
                    },
                };
                break;
        }
    }

    if (controllerStatus) {
        const statusClause: Prisma.UserWhereInput = { controllerStatus };
        if (studentClause) {
            studentClause = { AND: [studentClause, statusClause] };
        } else {
            studentClause = statusClause;
        }
    }

    if (studentClause) where.student = studentClause;
    return where;
};