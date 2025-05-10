'use server';

import prisma from "@/lib/db";
import {log} from "@/actions/log";
import {z} from "zod";
import {CertificationOption} from "@prisma/client";
import {revalidatePath} from "next/cache";

export const createOrUpdateLessonRosterChange = async (formData: FormData) => {
    const rosterChangeZ = z.object({
        id: z.string().optional(),
        lessonId: z.string(),
        certificationTypeId: z.string(),
        certificationOption: z.nativeEnum(CertificationOption),
        dossierMessage: z.string().min(1, "Dossier message is required").max(200, "Dossier message cannot be longer than 200 characters"),
    });

    const result = rosterChangeZ.safeParse({
        id: formData.get('id'),
        lessonId: formData.get('lessonId'),
        certificationTypeId: formData.get('certificationTypeId'),
        certificationOption: formData.get('certificationOption') as CertificationOption,
        dossierMessage: formData.get('dossierMessage'),
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const lessonRosterChange = await prisma.lessonRosterChange.upsert({
        create: {
            lessonId: result.data.lessonId,
            certificationTypeId: result.data.certificationTypeId,
            certificationOption: result.data.certificationOption,
            dossierText: result.data.dossierMessage,
        },
        update: {
            certificationTypeId: result.data.certificationTypeId,
            certificationOption: result.data.certificationOption,
            dossierText: result.data.dossierMessage,
        },
        where: {
            id: result.data.id || '',
        },
        include: {
            lesson: true,
            certificationType: true,
        },
    });

    await log(result.data.id ? 'UPDATE' : 'CREATE', 'LESSON_ROSTER_CHANGE', `Saved lesson roster change ${lessonRosterChange.certificationType.name} for lesson ${lessonRosterChange.lesson.name}`);

    revalidatePath(`/training/lessons/${lessonRosterChange.lessonId}/edit`);

    return {lessonRosterChange};
}

export const deleteLessonRosterChange = async (id: string) => {
    const lrc = await prisma.lessonRosterChange.delete({
        where: {
            id,
        },
        include: {
            lesson: true,
            certificationType: true,
        },
    });

    await log("DELETE", "LESSON_ROSTER_CHANGE", `Deleted lesson roster change ${lrc.certificationType.name} for lesson ${lrc.lesson.name}`);

    revalidatePath(`/training/lessons/${lrc.lessonId}/edit`);

    return lrc;
}