'use server';

import prisma from "@/lib/db";
import {Prisma, StaffingRequest} from "@/generated/prisma/client";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";

export const createStaffingRequest = async (formData: FormData) => {

    const staffingRequestZ = z.object({
        userId: z.string(),
        name: z.string().min(1, 'Name must be at least 1 character long'),
        description: z.string().min(1, 'Description must be at least 1 character long'),
    });

    const result = staffingRequestZ.safeParse({
        userId: formData.get('userId'),
        name: formData.get('name') as string,
        description: formData.get('description') as string,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const staffingRequest = await prisma.staffingRequest.create({
        data: {
            name: result.data.name,
            description: result.data.description,
            user: {
                connect: {
                    id: result.data.userId,
                }
            }
        }
    });

    revalidatePath("/admin/staffing-requests");
    return {staffingRequest};
}

export const closeStaffingRequest = async (staffingRequest: StaffingRequest) => {
    const deletedStaffingRequest = await prisma.staffingRequest.delete({
        where: {
            id: staffingRequest.id,
        },
    });

    await log("DELETE", "STAFFING_REQUEST", `Deleted staffing request ${deletedStaffingRequest.name}`);
    revalidatePath("/admin/staffing-requests");
    return deletedStaffingRequest;
}

export const fetchStaffingRequests = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.StaffingRequestOrderByWithRelationInput = {};
    if (sort.length > 0) {
        const sortField = sort[0].field as keyof Prisma.StaffingRequestOrderByWithRelationInput;
        orderBy[sortField] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.staffingRequest.count({
            where: getWhere(filter),
        }),
        prisma.staffingRequest.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
            include: {
                user: true,
            },
        })
    ]);
};

const getWhere = (filter?: GridFilterItem): Prisma.StaffingRequestWhereInput => {
    if (!filter) {
        return {};
    }
    switch (filter?.field) {
        case 'user':
            return {
                user: {
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
        case 'cid':
            return {
                user: {
                    cid: {
                        [filter.operator]: filter.value as string,
                        mode: 'insensitive',
                    }
                }
            };
        case 'email':
            return {
                user: {
                    email: {
                        [filter.operator]: filter.value as string,
                        mode: 'insensitive',
                    }
                }
            };
        case 'name':
            return {
                name: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        default:
            return {};
    }
};