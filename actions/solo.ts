'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";
import {addVatusaSolo, deleteVatusaSolo} from "@/actions/vatusa/controller";
import {sendSoloAddedEmail, sendSoloDeletedEmail, sendSoloExpiredEmail} from "@/actions/mail/solo";
import {User} from "next-auth";
import {Prisma} from "@prisma/client";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";

export const addSolo = async (formData: FormData) => {

    const soloZ = z.object({
        controller: z.string(),
        certificationType: z.string(),
        position: z.string(),
        expires: z.string(),
    });

    const result = soloZ.safeParse({
        controller: formData.get('controller') as string,
        certificationType: formData.get('certificationType') as string,
        position: formData.get('position') as string,
        expires: formData.get('expires') as string,
    });

    if (!result.success) {
        return result.error;
    }

    const data = await prisma.soloCertification.create({
        data: {
            controller: {
                connect: {
                    id: result.data.controller,
                }
            },
            certificationType: {
                connect: {
                    id: result.data.certificationType,
                }
            },
            position: result.data.position,
            expires: new Date(result.data.expires),
        },
        include: {
            controller: true,
        },
    });

    await prisma.certification.upsert({
        create: {
            certificationOption: 'SOLO',
            certificationTypeId: result.data.certificationType,
            userId: result.data.controller,
        },
        update: {
            certificationOption: 'SOLO',
        },
        where: {
            certificationTypeId_userId: {
                certificationTypeId: result.data.certificationType,
                userId: result.data.controller,
            },
        },
    });

    await sendSoloAddedEmail(data.controller as User, data);

    await log('CREATE', 'SOLO_CERTIFICATION', `Created solo endorsement ${data.position} for ${data.controller.firstName} ${data.controller.lastName}`);

    await addVatusaSolo(data.controller.cid, data.position, data.expires);

    revalidatePath('/training/solos');
    revalidatePath('/controllers/roster');

}

export const deleteSolo = async (id: string) => {
    const ss = await prisma.soloCertification.delete({
        where: {
            id,
        },
        include: {
            controller: true,
            certificationType: true,
        }
    });

    if (ss.certificationType.autoAssignUnrestricted) {
        await prisma.certification.update({
            where: {
                certificationTypeId_userId: {
                    certificationTypeId: ss.certificationTypeId,
                    userId: ss.controller.id,
                },
            },
            data: {
                certificationOption: 'CERTIFIED',
            },
        });
    } else {
        await prisma.certification.update({
            where: {
                certificationTypeId_userId: {
                    certificationTypeId: ss.certificationTypeId,
                    userId: ss.controller.id,
                },
            },
            data: {
                certificationOption: 'NONE',
            },
        });
    }

    await sendSoloDeletedEmail(ss.controller as User, ss);

    await log('DELETE', 'SOLO_CERTIFICATION', `Deleted solo endorsement ${ss.position} for ${ss.controller.firstName} ${ss.controller.lastName}`);

    await deleteVatusaSolo(ss.controller.cid, ss.position);

    revalidatePath('/training/solos')
    revalidatePath('/controllers/roster');
}

export const deleteExpiredSolos = async () => {
    const solos = await prisma.soloCertification.findMany({
        where: {
            expires: {
                lte: new Date(),
            }
        },
        include: {
            controller: true,
            certificationType: true,
        }
    });

    for (const solo of solos) {
        await prisma.soloCertification.delete({
            where: {
                id: solo.id,
            }
        });

        if (solo.certificationType.autoAssignUnrestricted) {
            await prisma.certification.update({
                where: {
                    certificationTypeId_userId: {
                        certificationTypeId: solo.certificationTypeId,
                        userId: solo.controller.id,
                    },
                },
                data: {
                    certificationOption: 'CERTIFIED',
                },
            });
        } else {
            await prisma.certification.update({
                where: {
                    certificationTypeId_userId: {
                        certificationTypeId: solo.certificationTypeId,
                        userId: solo.controller.id,
                    },
                },
                data: {
                    certificationOption: 'NONE',
                },
            });
        }


        await sendSoloExpiredEmail(solo.controller as User, solo);

        await log('DELETE', 'SOLO_CERTIFICATION', `Deleted expired solo endorsement ${solo.position} for ${solo.controller.firstName} ${solo.controller.lastName}`);

        await deleteVatusaSolo(solo.controller.cid, solo.position);
    }

    revalidatePath('/training/solos');
    revalidatePath('/controllers/roster');
}

export const fetchSoloCertifications = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.SoloCertificationOrderByWithRelationInput = {};
    if (sort.length > 0) {
        const sortField = sort[0].field as keyof Prisma.SoloCertificationOrderByWithRelationInput;
        orderBy[sortField] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.soloCertification.count({
            where: getWhere(filter),
        }),
        prisma.soloCertification.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
            include: {
                controller: true,
                certificationType: true,
            },
        })
    ]);
};

const getWhere = (filter?: GridFilterItem): Prisma.SoloCertificationWhereInput => {
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
        case 'certification':
            return {
                certificationType: {
                    name: {
                        [filter.operator]: filter.value as string,
                        mode: 'insensitive',
                    },
                },
            };
        case 'position':
            return {
                position: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        default:
            return {};
    }
};