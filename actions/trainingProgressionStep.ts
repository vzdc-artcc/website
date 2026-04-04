'use server';

import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {Prisma, TrainingProgression} from "@/generated/prisma/client";
import prisma from "@/lib/db";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {OrderItem} from "@/components/Order/OrderList";

export const createOrUpdateTrainingProgressionStep = async (formData: FormData) => {

    const stepZ = z.object({
        stepId: z.string().optional(),
        progressionId: z.string(),
        lessonId: z.string(),
        optional: z.boolean(),
    });

    const result = stepZ.safeParse({
        stepId: formData.get('stepId') as string,
        progressionId: formData.get('progressionId') as string,
        lessonId: formData.get('lessonId') as string,
        optional: formData.get('optional') === 'on',
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const matchingStep = await prisma.trainingProgressionStep.findFirst({
        where: {
            progressionId: result.data.progressionId,
            lessonId: result.data.lessonId,
        },
    });

    if (matchingStep && matchingStep.id !== result.data.stepId) {
        return {errors: [{message: `This lesson is already a step in this progression`}]};
    }

    const step = await prisma.trainingProgressionStep.upsert({
        where: {
            id: result.data.stepId,
        },
        update: {
            lessonId: result.data.lessonId,
            optional: result.data.optional,
        },
        create: {
            progressionId: result.data.progressionId,
            lessonId: result.data.lessonId,
            optional: result.data.optional,
        },
        include: {
            progression: true,
            lesson: true,
        }
    });

    if (result.data.stepId) {
        await log("UPDATE", "TRAINING_PROGRESSION_STEP", `Updated training progression step ${step.lesson.identifier} for ${step.progression.name}`);
    } else {
        await log("CREATE", "TRAINING_PROGRESSION_STEP", `Created training progression step ${step.lesson.identifier} for ${step.progression.name}`);
    }

    revalidatePath(`/training/progressions`, 'layout');

    return {step};
}

export const fetchTrainingProgressionSteps = async (progression: TrainingProgression, pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {

    const orderBy: Prisma.TrainingProgressionStepOrderByWithRelationInput = {};

    if (sort.length > 0) {
        const sortModel = sort[0];
        switch (sortModel.field) {
            case 'lesson':
                orderBy.lesson = {
                    identifier: sortModel.sort === 'asc' ? 'asc' : 'desc',
                };
                break;
            case 'optional':
                orderBy.optional = sortModel.sort === 'asc' ? 'asc' : 'desc';
                break;
            case 'order':
                orderBy.order = sortModel.sort === 'asc' ? 'asc' : 'desc';
                break;
        }
    }

    return prisma.$transaction([
        prisma.trainingProgressionStep.count({
            where: {
                progressionId: progression.id,
                ...getWhere(filter),
            },
        }),
        prisma.trainingProgressionStep.findMany({
            orderBy,
            where: {
                progressionId: progression.id,
                ...getWhere(filter),
            },
            include: {
                lesson: true,
            },
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
        })
    ]);
}

const getWhere = (filter?: GridFilterItem): Prisma.TrainingProgressionStepWhereInput => {
    if (!filter) return {};

    switch (filter.field) {
        case 'lesson':
            return {
                lesson: {
                    identifier: {
                        [filter.operator]: filter.value as string,
                        mode: 'insensitive',
                    },
                },
            };
        case 'optional':
            return {
                optional: filter.value === 'true',
            };
        case 'order':
            return {
                order: {
                    [filter.operator]: filter.value as number,
                },
            };
        default:
            return {};
    }
}

export const deleteTrainingProgressionStep = async (id: string) => {
    const tps = await prisma.trainingProgressionStep.delete({
        where: {
            id,
        },
        include: {
            progression: true,
            lesson: true,
        },
    });

    await log("DELETE", "TRAINING_PROGRESSION_STEP", `Deleted training progression step ${tps.lesson.identifier} in ${tps.progression.name}`);

    revalidatePath(`/training/progressions`, 'layout');
}

export const updateTrainingProgressionStepOrder = async (items: OrderItem[]) => {
    let progression: TrainingProgression | null = null;
    for (const item of items) {
        const tps: any = await prisma.trainingProgressionStep.update({
            data: {
                order: item.order,
            },
            where: {
                id: item.id,
            },
            include: {
                progression: !progression,
            },
        });

        if (!progression) {
            progression = tps.progression;
        }
    }

    await log('UPDATE', 'TRAINING_PROGRESSION_STEP', `Updated training step order for ${progression?.name}`);

    revalidatePath(`/training/progressions`, 'layout');
}