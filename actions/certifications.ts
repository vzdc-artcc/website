'use server';

import {Certification, CertificationOption} from "@/generated/prisma/client";
import prisma from "@/lib/db";
import {revalidatePath} from "next/cache";
import {writeDossier} from "@/actions/dossier";
import {log} from "@/actions/log";

export const saveCertifications = async (cid: string, certifications: Certification[], dossierMessage: string) => {

    const user = await prisma.user.findUnique({
        where: {
            cid,
        },
    });

    for (const certification of certifications) {
        if (certification.id) {
            await prisma.certification.update({
                where: {
                    id: certification.id,
                },
                data: {
                    certificationOption: certification.certificationOption,
                },
            });
        } else {
            await prisma.certification.create({
                data: {
                    certificationOption: certification.certificationOption,
                    certificationType: {
                        connect: {
                            id: certification.certificationTypeId,
                        },
                    },
                    controller: {
                        connect: {
                            cid,
                        },
                    },
                },
            });
        }
    }
    await log("UPDATE", "CERTIFICATION", `Updated certifications for ${user?.firstName} ${user?.lastName} (${cid})`);
    await writeDossier(dossierMessage, cid);
    revalidatePath('/profile/overview');
}

export const fetchCertifications = async (cid: string) => {
    const user = await prisma.user.findUnique({
        where: {
            cid,
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    const certificationTypes = await prisma.certificationType.findMany({
        orderBy: {
            order: 'asc',
        },
    });

    const certifications = await prisma.certification.findMany({
        where: {
            controller: {
                id: user.id,
            },
        },
        include: {
            certificationType: true,
        },
    });

    const result: {
        certification: string,
        status: CertificationOption,
    }[] = [];

    for (const certificationType of certificationTypes) {
        const certification = certifications.find(c => c.certificationTypeId === certificationType.id);
        result.push({
            certification: certificationType.name,
            status: certification ? certification.certificationOption : 'NONE',
        });
    }

    return result;
}