'use server';

import {CertificationOption} from "@prisma/client";
import {z} from "zod";
import prisma from "@/lib/db";
import {revalidatePath} from "next/cache";
import {log} from "@/actions/log";
import {OrderItem} from "@/components/Order/OrderList";

export const createOrUpdateCertificationType = async (formData: FormData) => {
    const certificationTypeZ = z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Name is required").max(20, "Name cannot be longer than 20 characters"),
        // order: z.number().int("Order must be a whole number"),
        canSoloCert: z.boolean(),
        autoAssignUnrestricted: z.boolean(),
        certificationOptions: z.array(z.nativeEnum(CertificationOption)),
    });

    const result = certificationTypeZ.safeParse({
        id: formData.get('id'),
        name: formData.get('name'),
        // order: parseInt(formData.get('order') as string),
        canSoloCert: formData.get('canSoloCert') === 'on',
        autoAssignUnrestricted: formData.get('autoAssignUnrestricted') === 'on',
        certificationOptions: (formData.get('certificationOptions') as unknown as string).split(',') as CertificationOption[],
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const oldLessonRosterChanges = await prisma.lessonRosterChange.findMany({
        where: {
            certificationTypeId: result.data.id || '',
            certificationOption: {
                notIn: result.data.certificationOptions,
            },
        },
        include: {
            lesson: true,
        },
    });

    if (oldLessonRosterChanges.length > 0) {
        return {errors: [{message: `Cannot update certification type because there are invalid certification options on the following lessons: ${oldLessonRosterChanges.map((change) => change.lesson.identifier).join(', ')}.  Fix these conflicts and then submit your update.`}]};
    }

    const certificationType = await prisma.certificationType.upsert({
        create: {
            name: result.data.name,
            order: 0,
            canSoloCert: result.data.canSoloCert,
            autoAssignUnrestricted: result.data.autoAssignUnrestricted,
            certificationOptions: result.data.certificationOptions,
        },
        update: {
            name: result.data.name,
            canSoloCert: result.data.canSoloCert,
            autoAssignUnrestricted: result.data.autoAssignUnrestricted,
            certificationOptions: result.data.certificationOptions,
        },
        where: {
            id: result.data.id || '',
        },
    });

    await log(result.data.id ? 'UPDATE' : 'CREATE', 'CERTIFICATION_TYPE', `Saved certification type ${certificationType.name}`);

    revalidatePath('/admin/certifications');
    return {certificationType};
}

export const updateCertificationTypeOrder = async (items: OrderItem[]) => {
    for (const item of items) {
        await prisma.certificationType.update({
            data: {
                order: item.order,
            },
            where: {
                id: item.id,
            },
        });
    }

    await log('UPDATE', 'CERTIFICATION_TYPE', 'Updated certification type order');
    revalidatePath('/admin/controller', 'layout');
    revalidatePath('/admin/certification-types', 'layout');
    revalidatePath('/controllers/roster', 'layout');
}

export const deleteCertificationType = async (id: string) => {
    revalidatePath('/admin/certifications');
    const data = await prisma.certificationType.delete({
        where: {
            id,
        },
    });
    await log('DELETE', 'CERTIFICATION_TYPE', `Deleted certification type ${data.name}`)
    return data;
}