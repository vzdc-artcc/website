'use server';

import {z} from "zod";
import {Feedback, FeedbackStatus, Prisma} from "@prisma/client";
import prisma from "@/lib/db";
import {revalidatePath} from "next/cache";
import {log} from "@/actions/log";
import {sendNewFeedbackEmail} from "@/actions/mail/feedback";
import {User} from "next-auth";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";

const operatorMapping: { [key: string]: keyof Prisma.IntFilter } = {
    '=': 'equals',
    '<': 'lt',
    '>': 'gt',
    '<=': 'lte',
    '>=': 'gte',
};

export const submitFeedback = async (formData: FormData) => {

    const feedbackZ = z.object({
        pilotId: z.string().min(1),
        pilotCallsign: z.string().trim().min(1),
        controllerId: z.string().trim().min(1),
        controllerPosition: z.string().min(1),
        rating: z.number({required_error: 'Rating is required', invalid_type_error: 'Rating is required'}),
        comments: z.string().trim(),
    });

    const result = feedbackZ.safeParse({
        pilotId: formData.get('pilotId') as string,
        pilotCallsign: formData.get('pilotCallsign') as string,
        controllerId: formData.get('controllerId') as string,
        controllerPosition: formData.get('controllerPosition') as string,
        rating: parseInt(formData.get('rating') as string),
        comments: formData.get('comments') as string,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    if (result.data.pilotId === result.data.controllerId) {
        return {errors: [{message: "You cannot submit feedback for yourself."}]};
    }

    const feedback = await prisma.feedback.create({
        data: {
            pilot: {
                connect: {
                    id: result.data.pilotId,
                },
            },
            pilotCallsign: result.data.pilotCallsign,
            controller: {
                connect: {
                    id: result.data.controllerId,
                },
            },
            controllerPosition: result.data.controllerPosition,
            rating: result.data.rating,
            comments: result.data.comments,
            submittedAt: new Date(),
            status: "PENDING",
        },
    });
    revalidatePath('/admin/feedback');
    return {feedback};
}

export const releaseFeedback = async (feedback: Feedback) => {
    const releasedFeedback = await prisma.feedback.update({
        where: {
            id: feedback.id,
        },
        data: {
            status: "RELEASED",
            staffComments: feedback.staffComments,
            decidedAt: new Date(),
        },
        include: {
            controller: true,
        },
    });

    await sendNewFeedbackEmail(releasedFeedback.controller as User, releasedFeedback);

    await log("UPDATE", "FEEDBACK", `Released feedback for ${releasedFeedback.controller.firstName} ${releasedFeedback.controller.lastName} (${releasedFeedback.controller.cid})`);
    revalidatePath('/admin/feedback');
    revalidatePath(`/admin/feedback/${feedback.id}`);
}

export const stashFeedback = async (feedback: Feedback) => {
    const stashedFeedback = await prisma.feedback.update({
        where: {
            id: feedback.id,
        },
        data: {
            status: "STASHED",
            decidedAt: new Date(),
        },
        include: {
            controller: true,
        },
    });
    await log("UPDATE", "FEEDBACK", `Stashed feedback for ${stashedFeedback.controller.firstName} ${stashedFeedback.controller.lastName} (${stashedFeedback.controller.cid})`);
    revalidatePath('/admin/feedback');
    revalidatePath(`/admin/feedback/${feedback.id}`);
}

export const fetchFeedback = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.FeedbackOrderByWithRelationInput = {};
    if (sort.length > 0) {
        const sortField = sort[0].field as keyof Prisma.FeedbackOrderByWithRelationInput;
        orderBy[sortField] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.feedback.count({
            where: getWhere(filter),
        }),
        prisma.feedback.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
            include: {
                pilot: true,
                controller: true,
            },
        })
    ]);
}

const getWhere = (filter?: GridFilterItem): Prisma.FeedbackWhereInput => {
    if (!filter) {
        return {};
    }
    switch (filter?.field) {
        case 'controller':
            return {
                controller: {
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
        case 'pilot':
            return {
                pilot: {
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
        case 'controllerPosition':
            return {
                controllerPosition: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'rating':
            return {
                rating: {
                    [operatorMapping[filter.operator]]: parseInt(filter.value as string) || 0,
                },
            };
        case 'status':
            return {
                status: filter.value as FeedbackStatus,
            };
        default:
            return {};
    }
};