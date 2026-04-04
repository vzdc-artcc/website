'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import {revalidatePath} from "next/cache";
import {IncidentReport, Prisma} from "@/generated/prisma/client";
import {sendIncidentReportClosedEmail} from "@/actions/mail/incident";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";

export const createIncident = async (formData: FormData) => {
    const reportZ = z.object({
        reporteeCallsign: z.string(),
        reporterCallsign: z.string().optional(),
        reason: z.string(),
        reporteeId: z.string(),
        timestamp: z.date().refine((d) => d < new Date(), {message: 'Date must be in the past.'}),
    });

    const result = reportZ.safeParse({
        reporteeCallsign: formData.get('reporteeCallsign'),
        reporterCallsign: formData.get('reporterCallsign'),
        reason: formData.get('reason'),
        reporteeId: formData.get('reporteeId'),
        timestamp: new Date(formData.get('timestamp') as unknown as string),
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const session = await getServerSession(authOptions);

    const report = await prisma.incidentReport.create({
        data: {
            reporter: {
                connect: {
                    id: session?.user.id,
                },
            },
            reportee: {
                connect: {
                    id: result.data.reporteeId,
                },
            },
            closed: false,
            reporteeCallsign: result.data.reporteeCallsign,
            reporterCallsign: result.data.reporterCallsign,
            reason: result.data.reason,
            timestamp: result.data.timestamp,
        },
    });

    revalidatePath('/admin/incidents');

    return {report};
}

export const closeIncident = async (report: IncidentReport) => {
    const incident = await prisma.incidentReport.update({
        where: {
            id: report.id,
        },
        data: {
            closed: true,
        },
        include: {
            reporter: true,
            reportee: true,
        },
    });

    await sendIncidentReportClosedEmail(incident.reporter as User, incident.reportee as User);

    revalidatePath('/admin/incidents');
    revalidatePath(`/admin/incidents/${report.id}`);

}

export const fetchIncidents = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.IncidentReportOrderByWithRelationInput = {};
    if (sort.length > 0) {
        const sortField = sort[0].field as keyof Prisma.IncidentReportOrderByWithRelationInput;
        orderBy[sortField] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.incidentReport.count({
            where: getWhere(filter),
        }),
        prisma.incidentReport.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
            include: {
                reporter: true,
                reportee: true,
            },
        })
    ]);
}

const getWhere = (filter?: GridFilterItem): Prisma.IncidentReportWhereInput => {
    if (!filter) {
        return {};
    }
    switch (filter?.field) {
        case 'reporter':
            return {
                reporter: {
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
        case 'reportee':
            return {
                reportee: {
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
        case 'closed':
            return {
                closed: filter.value === 'true',
            };
        default:
            return {};
    }
};