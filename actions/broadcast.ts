'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {after} from "next/server";
import {log} from "@/actions/log";
import {sendBroadcastPostedEmail} from "@/actions/mail/broadcast";
import {User} from "next-auth";
import {revalidatePath} from "next/cache";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {Prisma} from "@/generated/prisma/client";
import {handleAgreeBroadcast} from "@/actions/broadcastViewer";

export const fetchBroadcasts = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    let orderBy: Prisma.ChangeBroadcastOrderByWithRelationInput = {};
    if (sort.length > 0) {
        if (sort[0].field === 'file') {
            orderBy = {
                file: {
                    name: sort[0].sort === 'asc' ? 'asc' : 'desc',
                },
            };
        } else {
            orderBy = {
                [sort[0].field]: sort[0].sort === 'asc' ? 'asc' : 'desc',
            };
        }
    }

    return prisma.$transaction([
        prisma.changeBroadcast.count({
            where: getWhere(filter),
        }),
        prisma.changeBroadcast.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
            include: {
                file: true,
                unseenBy: true,
                seenBy: true,
                agreedBy: true,
            },
        })
    ]);
}

const getWhere = (filter?: GridFilterItem) => {
    if (!filter) {
        return {};
    }

    switch (filter.field) {
        case 'title':
            return {
                title: {
                    [filter.operator]: filter.value as string,
                },
            };
        case 'file':
            return {
                file: {
                    name: {
                        [filter.operator]: filter.value as string,
                    },
                },
            };
        case 'exemptStaff':
            return {
                exemptStaff: filter.value === 'true',
            };
        default:
            return {};
    }
}

export const createOrUpdateBroadcast = async (formData: FormData) => {
    const broadcastZ = z.object({
        id: z.string().optional(),
        title: z.string().min(1, 'Title must be at least 1 character long.'),
        description: z.string().min(1, 'Description must be at least 1 character long.'),
        users: z.array(z.string()),
        file: z.string().optional(),
        exemptStaff: z.boolean(),
    });

    const result = broadcastZ.safeParse({
        id: formData.get('id') as string,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        users: (formData.get('users') as string).split(','),
        file: formData.get('file') as string,
        exemptStaff: formData.get('exemptStaff') === 'on',
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    let broadcast;

    if (result.data.id) {
        broadcast = await prisma.changeBroadcast.update({
            where: {
                id: result.data.id,
            },
            data: {
                title: result.data.title,
                description: result.data.description,
                file: result.data.file ? {
                    connect: {
                        id: result.data.file,
                    },
                } : undefined,
                timestamp: new Date(),
                exemptStaff: result.data.exemptStaff,
            },
        });

    } else {
        broadcast = await prisma.changeBroadcast.create({
            data: {
                title: result.data.title,
                description: result.data.description,
                file: result.data.file ? {
                    connect: {
                        id: result.data.file,
                    },
                } : undefined,
                timestamp: new Date(),
                exemptStaff: result.data.exemptStaff,
                unseenBy: {
                    connect: result.data.users.map((id) => ({id})),
                },
            },
            include: {
                unseenBy: true,
            },
        });

        if (result.data.exemptStaff) {
            const staff = await prisma.user.findMany({
                where: {
                    roles: {
                        has: 'STAFF',
                    },
                },
            });

            for (const user of staff) {
                await handleAgreeBroadcast(user as User, broadcast.id);
            }
        }

        sendBroadcastPostedEmail(broadcast, broadcast.unseenBy as User[]).then();
    }

    revalidatePath('/admin/broadcasts');

    after(async () => {
        if (broadcast && result.data?.id) {
            await log('UPDATE', 'BROADCAST', `Updated broadcast ${broadcast.title}`);
        } else if (broadcast) {
            await log('CREATE', 'BROADCAST', `Created broadcast ${broadcast.title}`);
        }
    });

    return {broadcast};
}

export const deleteBroadcast = async (id: string) => {
    const broadcast = await prisma.changeBroadcast.delete({
        where: {
            id,
        },
    });

    revalidatePath('/admin/broadcasts');

    after(async () => {
        await log('DELETE', 'BROADCAST', `Deleted broadcast ${broadcast.title}`);
    });
}

export const deleteStaleBroadcasts = async () => {
    await prisma.changeBroadcast.deleteMany({
        where: {
            timestamp: {
                lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 6), // 6 months
            },
        },
    });
}