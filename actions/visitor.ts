'use server';

import {Prisma, VisitorApplication, VisitorApplicationStatus} from "@prisma/client";
import prisma from "@/lib/db";
import {z} from "zod";
import {revalidatePath} from "next/cache";
import {log} from "@/actions/log";
import {User} from "next-auth";
import {addVatusaVisitor} from "@/actions/vatusa/roster";
import {sendVisitorApplicationAcceptedEmail, sendVisitorApplicationRejectedEmail} from "@/actions/mail/visitor";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {sendProgressionAssignedEmail} from "@/actions/mail/progression";
import {formatZuluDate} from "@/lib/date";

export const addVisitingApplication = async (formData: FormData) => {

    const visitorZ = z.object({
        userId: z.string(),
        homeFacility: z.string().trim().min(1, "Home ARTCC is required"),
        whyVisit: z.string().trim().min(1, "Reason for visiting is required"),
        meetUsaReqs: z.boolean().refine((val) => val, "You must meet the VATUSA visiting requirements"),
        meetZdcReqs: z.boolean().refine((val) => val, "You must agree to our visiting policy"),
        goodStanding: z.boolean().refine((val) => val, "You must be in good standing with your home ARTCC"),
        notRealWorld: z.boolean().refine((val) => val, "You must understand that we are not the real world FAA nor do we have any affiliation with them"),
    });

    const result = visitorZ.safeParse({
        userId: formData.get('userId'),
        homeFacility: formData.get("homeFacility"),
        whyVisit: formData.get("whyVisit"),
        meetUsaReqs: formData.get("meetUsaReqs") === 'on',
        meetZdcReqs: formData.get("meetZdcReqs") === 'on',
        goodStanding: formData.get("goodStanding") === 'on',
        notRealWorld: formData.get("notRealWorld") === 'on',
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const existing = await prisma.visitorApplication.findFirst({
        where: {
            userId: result.data.userId,
            status: "PENDING",
        },
    });
    if (existing) {
        return {errors: [{message: "You already have a pending visitor application"},]};
    }

    const lastRejected = await prisma.visitorApplication.findFirst({
        where: {
            userId: result.data.userId,
            status: "DENIED",
        },
    });

    await prisma.visitorApplication.deleteMany({
        where: {
            userId: result.data.userId,
        },
    });

    const application = await prisma.visitorApplication.create({
        data: {
            homeFacility: result.data.homeFacility,
            whyVisit: result.data.whyVisit + (lastRejected ? `\n\nAUTOMATIC NOTE: This user previously had a visitor application rejected on ${formatZuluDate(lastRejected.decidedAt || new Date())}.\nREASON: ${lastRejected.reasonForDenial})\nThe previous application has been deleted to accommodate this one.` : ''),
            user: {
                connect: {
                    id: result.data.userId,
                }
            },
            status: "PENDING",
            submittedAt: new Date(),
        },
        include: {
            user: true,
        },
    });

    revalidatePath('/admin/visitor-applications');
    revalidatePath('/visitor/new');
    return {application};
}

export const addVisitor = async (application: VisitorApplication, user: User) => {
    if (application.status !== "PENDING") return;

    const visitorProgression = await prisma.trainingProgression.findFirst({
        where: {
            autoAssignNewVisitor: true,
        },
    });

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            controllerStatus: "VISITOR",
            showWelcomeMessage: true,
            trainingProgressionId: visitorProgression?.id,
        },
    });
    await prisma.visitorApplication.update({
        where: {
            id: application.id,
        },
        data: {
            status: "APPROVED",
            decidedAt: new Date(),
        },
        include: {
            user: true,
        },
    });

    await log("UPDATE", "VISITOR_APPLICATION", `Approved visitor application for ${user.fullName} (${user.cid})`);

    await addVatusaVisitor(user.cid);

    await sendVisitorApplicationAcceptedEmail(user);
    if (visitorProgression) {
        await sendProgressionAssignedEmail(user, visitorProgression);
    }

    revalidatePath('/controllers/roster');
    revalidatePath('/admin/visitor-applications');
    revalidatePath(`/admin/visitor-applications/${application.id}`);
    revalidatePath('/visitor/new');
}

export const rejectVisitor = async (application: VisitorApplication, user: User) => {
    if (application.status !== "PENDING") return;
    await prisma.visitorApplication.update({
        where: {
            id: application.id,
        },
        data: {
            status: "DENIED",
            decidedAt: new Date(),
            reasonForDenial: application.reasonForDenial,
        },
        include: {
            user: true,
        },
    });

    await sendVisitorApplicationRejectedEmail(user, application);

    await log("UPDATE", "VISITOR_APPLICATION", `Rejected visitor application for ${user.fullName} (${user.cid})`);
    revalidatePath('/admin/visitor-applications');
    revalidatePath(`/admin/visitor-applications/${application.id}`);
    revalidatePath('/visitor/new');
}

export const fetchVisitorApplications = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.VisitorApplicationOrderByWithRelationInput = {};
    if (sort.length > 0) {
        const sortField = sort[0].field as keyof Prisma.VisitorApplicationOrderByWithRelationInput;
        orderBy[sortField] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.visitorApplication.count({
            where: getWhere(filter),
        }),
        prisma.visitorApplication.findMany({
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

const getWhere = (filter?: GridFilterItem): Prisma.VisitorApplicationWhereInput => {
    if (!filter) {
        return {};
    }
    switch (filter?.field) {
        case 'name':
            return {
                user: {
                    fullName: {
                        [filter.operator]: filter.value as string,
                        mode: 'insensitive',
                    },
                },
            };
        case 'email':
            return {
                user: {
                    email: {
                        [filter.operator]: filter.value as string,
                        mode: 'insensitive',
                    },
                },
            };
        case 'cid':
            return {
                user: {
                    cid: filter.value as string,
                },
            };
        case 'homeFacility':
            return {
                homeFacility: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'status':
            return {
                status: filter.value as VisitorApplicationStatus,
            };
        default:
            return {};
    }
};