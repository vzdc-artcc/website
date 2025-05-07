'use server';
import prisma from "@/lib/db";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {Prisma} from "@prisma/client";
import {after} from "next/server";

export const deleteLesson = async (id: string) => {
    const lesson = await prisma.lesson.delete({
        where: {id}
    });

    await log("DELETE", "LESSON", `Deleted lesson ${lesson.identifier} - ${lesson.name}`);
    revalidatePath("/training/lessons");
}

export const createOrUpdateLessonDetails = async (formData: FormData) => {
    const ldz = z.object({
        identifier: z.string(),
        name: z.string(),
        duration: z.number().min(10, "Duration must be at least 10 minutes"),
        location: z.number().min(0).max(2),
        facility: z.string(),
        position: z.string(),
        description: z.string(),
        traineePreparation: z.string(),
        instructorOnly: z.boolean(),
        notifyInstructorOnPass: z.boolean(),
        releaseRequestOnPass: z.boolean(),
        lessonId: z.string().optional(),
    });

    const result = ldz.safeParse({
        identifier: formData.get("identifier") as string,
        name: formData.get("name") as string,
        duration: parseInt(formData.get("duration") as string),
        location: parseInt(formData.get("location") as string),
        facility: formData.get("facility") as string,
        position: formData.get("position") as string,
        description: formData.get("description") as string,
        traineePreparation: formData.get("traineePreparation") as string,
        instructorOnly: formData.get("instructorOnly") === "on",
        notifyInstructorOnPass: formData.get("notifyInstructorOnPass") === "on",
        releaseRequestOnPass: formData.get("releaseRequestOnPass") === "on",
        lessonId: formData.get("lessonId") as string,
    });

    if (!result.success) {
        return {id: null, error: result.error};
    }

    if (result.data.lessonId) {
        await prisma.lesson.update({
            where: {id: result.data.lessonId},
            data: {
                identifier: result.data.identifier,
                name: result.data.name,
                duration: result.data.duration,
                facility: result.data.facility,
                location: result.data.location,
                position: result.data.position,
                description: result.data.description,
                traineePreparation: result.data.traineePreparation,
                instructorOnly: result.data.instructorOnly,
                notifyInstructorOnPass: result.data.notifyInstructorOnPass,
                releaseRequestOnPass: result.data.releaseRequestOnPass,
                updatedAt: new Date(),
            },
        });

        await log("UPDATE", "LESSON", `Updated lesson ${result.data.identifier} - ${result.data.name}`);
    } else {
        const lesson = await prisma.lesson.create({
            data: {
                identifier: result.data.identifier,
                name: result.data.name,
                duration: result.data.duration,
                location: result.data.location,
                facility: result.data.facility,
                position: result.data.position,
                description: result.data.description,
                traineePreparation: result.data.traineePreparation,
                instructorOnly: result.data.instructorOnly,
                notifyInstructorOnPass: result.data.notifyInstructorOnPass,
                releaseRequestOnPass: result.data.releaseRequestOnPass,
                updatedAt: new Date(),
            },
        });

        await log("CREATE", "LESSON", `Created lesson ${result.data.identifier} - ${result.data.name}`);
        return {id: lesson.id, error: null};
    }

    revalidatePath(`/training/lessons/`, "layout");

    return {id: result.data.lessonId, error: null};
}

export const fetchLessons = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.LessonOrderByWithRelationInput = {};
    if (sort.length > 0) {
        const sortField = sort[0].field as keyof Prisma.LessonOrderByWithRelationInput;
        orderBy[sortField] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.lesson.count({
            where: getWhere(filter),
        }),
        prisma.lesson.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
        })
    ]);
};

const getWhere = (filter?: GridFilterItem): Prisma.LessonWhereInput => {
    if (!filter) {
        return {};
    }
    switch (filter?.field) {
        case 'name':
            return {
                name: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'identifier':
            return {
                identifier: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'facility':
            return {
                facility: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'position':
            return {
                position: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'instructorOnly':
            return {
                instructorOnly: filter.value === 'true',
            };
        case 'notifyInstructorOnPass':
            return {
                notifyInstructorOnPass: filter.value === 'true',
            };
        default:
            return {};
    }
};

export const updateLessonIndicator = async (lessonId: string, performanceIndicatorId?: string) => {

    if (!performanceIndicatorId) {

        const lesson = await prisma.lesson.findUnique({
            where: {
                id: lessonId,
            },
        });

        await prisma.lessonPerformanceIndicator.deleteMany({
            where: {
                lessonId,
            },
        });


        after(async () => {
            await log("DELETE", "LESSON_PERFORMANCE_INDICATOR", `Removed for lesson ${lesson?.name}`);
        });

        return;
    }

    const lpi = await prisma.lessonPerformanceIndicator.upsert({
        where: {
            lessonId,
        },
        create: {
            lessonId,
            templateId: performanceIndicatorId,
        },
        update: {
            templateId: performanceIndicatorId,
        },
        include: {
            lesson: true,
        },
    });

    after(async () => {
        await log("UPDATE", "LESSON_PERFORMANCE_INDICATOR", `Updated for lesson ${lpi.lesson.identifier}`);
    });

}