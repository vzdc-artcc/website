'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";
import {sendLoaApprovedEmail, sendLoaDeletedEmail, sendLoaDeniedEmail, sendLoaExpiredEmail,} from "@/actions/mail/loa";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {LOAStatus, Prisma} from "@/generated/prisma/client";

export const createOrUpdateLoa = async (formData: FormData) => {
    const loaZ = z.object({
        loaId: z.string().optional(),
        start: z.date({required_error: "You must select a start date."}),
        end: z.date({required_error: "You must select an end date."}).refine(end => {
            const dateStart = new Date(formData.get("start") as string);
            const dateEnd = new Date(end);
            const diffTime = Math.abs(dateEnd.getTime() - dateStart.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 7;
        }, {message: "End date must be at least 7 days after start date."}),
        reason: z.string().min(1, "Reason is required"),
    });

    const result = loaZ.safeParse({
        loaId: formData.get("id") as string,
        start: new Date(formData.get("start") as string),
        end: new Date(formData.get("end") as string),
        reason: formData.get("reason") as string,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const session = await getServerSession(authOptions);

    if (result.data.loaId && session) {
        const loa = await prisma.lOA.update({
            where: {
                id: result.data.loaId,
            },
            data: {
                start: result.data.start,
                end: result.data.end,
                reason: result.data.reason,
                status: "PENDING",
            },
        });

        await log("UPDATE", "LOA", `User ${session.user.firstName} ${session.user.lastName} updated LOA request`);
        revalidatePath("/profile", "layout");
        return {loa};
    } else if (session) {
        const loa = await prisma.lOA.create({
            data: {
                start: result.data.start,
                end: result.data.end,
                reason: result.data.reason,
                userId: session.user.id,
                status: "PENDING",
            },
        });

        await log("CREATE", "LOA", `User ${session.user.firstName} ${session.user.lastName} requested LOA`);
        revalidatePath("/profile", "layout");
        return {loa};
    }

    return {loa: null};
}

export const deleteLoa = async (loaId: string) => {
    const loa = await prisma.lOA.update({
        data: {
            status: "INACTIVE",
        },
        where: {
            id: loaId,
        },
        include: {
            user: true,
        },
    });

    await sendLoaDeletedEmail(loa.user as User);

    await log("DELETE", "LOA", `LOA request for ${loa.user.firstName} ${loa.user.lastName} (${loa.user.cid}) deleted (inactive).`);
    revalidatePath("/profile", "layout");
    return {loa};
}

export const approveLoa = async (loaId: string) => {

    const loa = await prisma.lOA.update({
        where: {
            id: loaId,
        },
        data: {
            status: "APPROVED",
        },
        include: {
            user: true,
        }
    });

    await sendLoaApprovedEmail(loa.user as User, loa);
    await log("UPDATE", "LOA", `LOA request for ${loa.user.firstName} ${loa.user.lastName} (${loa.user.cid}) approved`);
    revalidatePath("/admin/loas", "layout");
    revalidatePath("/profile", "layout");
    return {loa};
}

export const denyLoa = async (loaId: string) => {

    const loa = await prisma.lOA.update({
        where: {
            id: loaId,
        },
        data: {
            status: "DENIED",
        },
        include: {
            user: true,
        }
    });

    await sendLoaDeniedEmail(loa.user as User, loa);
    await log("UPDATE", "LOA", `LOA request for ${loa.user.firstName} ${loa.user.lastName} (${loa.user.cid}) denied`);
    revalidatePath("/admin/loas", "layout");
    revalidatePath("/profile", "layout");
    return {loa};
}

export const deleteExpiredLoas = async () => {

    const expiredLoas = await prisma.lOA.findMany({
        where: {
            end: {
                lt: new Date(),
            },
            status: 'APPROVED',
        },
        include: {
            user: true,
        },
    });

    // For each expired LOA
    for (const loa of expiredLoas) {
        // Delete the LOA
        await prisma.lOA.update({
            where: {
                id: loa.id,
            },
            data: {
                status: "INACTIVE",
            },
        });

        // Send the LOA deleted email to the user
        await sendLoaExpiredEmail(loa.user as User);
    }

    revalidatePath("/profile", "layout");
    return {expiredLoas};
}

export const fetchLoas = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.LOAOrderByWithRelationInput = {};
    if (sort.length > 0) {
        const sortField = sort[0].field as keyof Prisma.LOAOrderByWithRelationInput;
        orderBy[sortField] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.lOA.count({
            where: getWhere(filter),
        }),
        prisma.lOA.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
            include: {
                user: true,
            },
        })
    ]);
}

const getWhere = (filter?: GridFilterItem): Prisma.LOAWhereInput => {
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
        case 'status':
            return {
                status: filter.value as LOAStatus,
            };
        default:
            return {};
    }
};