'use server';

import prisma from "@/lib/db";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {Prisma} from "@prisma/client";
import {sendReleaseRequestApprovedEmail} from "@/actions/mail/training";

export const releaseTrainingAssignment = async (student?: User) => {

    const session = await getServerSession(authOptions);

    if (!session) {
        throw new Error('You must be logged in to release your training assignment.');
    }

    const releaseRequest = await prisma.trainerReleaseRequest.findFirst({
        where: {
            studentId: student?.id || session.user.id,
        }
    });

    if (releaseRequest) {
        return 'There is already a release request active.';
    }

    const release = await prisma.trainerReleaseRequest.create({
        data: {
            studentId: student?.id || session.user.id,
            submittedAt: new Date(),
        }
    });

    if (!student) {
        await log("CREATE", "TRAINER_RELEASE_REQUEST", 'Requested to release trainers');
    } else {
        await log("CREATE", "TRAINER_RELEASE_REQUEST", `Requested to release student ${student.fullName} (${student.cid})`);
    }

    revalidatePath('/training/releases');

    return release;
}

export const cancelReleaseRequest = async (releaseId: string,) => {

    const session = await getServerSession(authOptions);

    if (!session) {
        throw new Error('You must be logged in to cancel your release request.');
    }

    await prisma.trainerReleaseRequest.delete({
        where: {
            id: releaseId,
        },
    });

    await log("DELETE", "TRAINER_RELEASE_REQUEST", 'Cancelled release request');

    revalidatePath('/training/releases');
}

export const fetchTrainerReleases = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.TrainerReleaseRequestOrderByWithRelationInput = {};
    if (sort.length > 0 && sort[0].field === 'submittedAt') {
        orderBy.submittedAt = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    const where = getWhere(filter);

    return prisma.$transaction([
        prisma.trainerReleaseRequest.count({where}),
        prisma.trainerReleaseRequest.findMany({
            orderBy,
            include: {
                student: true,
            },
            where,
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
        }),
    ]);
};

const getWhere = (filter?: GridFilterItem): Prisma.TrainerReleaseRequestWhereInput => {
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
        default:
            return {};
    }
};

export const approveReleaseRequest = async (studentId: string) => {

    const session = await getServerSession(authOptions);

    if (!session) {
        throw new Error('You must be logged in to approve a release request.');
    }

    const assignment = await prisma.trainingAssignment.delete({
        where: {
            studentId,
        },
        include: {
            primaryTrainer: true,
            otherTrainers: true,
        }
    });

    const release = await prisma.trainerReleaseRequest.delete({
        where: {
            studentId: studentId,
        },
        include: {
            student: true,
        }
    });

    await log("DELETE", "TRAINING_ASSIGNMENT", `Released trainers for student ${release.student.fullName} (${release.student.cid})`);

    sendReleaseRequestApprovedEmail(release.student as User, [assignment.primaryTrainer as User, ...assignment.otherTrainers as User[]]).then();
    revalidatePath('/training/releases');
}

export const deleteTrainingRelease = async (studentId: string) => {
    const session = await getServerSession(authOptions);

    if (!session) {
        throw new Error('You must be logged in to delete a release request.');
    }

    const release = await prisma.trainerReleaseRequest.delete({
        where: {
            studentId,
        },
        include: {
            student: true,
        },
    });

    await log("DELETE", "TRAINER_RELEASE_REQUEST", `Deleted release request for ${release.student.fullName} (${release.student.cid})`);

    revalidatePath('/training/releases');
}