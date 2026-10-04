'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";

export const createOrUpdateLessonCriteriaCell = async (formData: FormData) => {
    const cellZ = z.object({
        lessonId: z.string(),
        criteriaId: z.string(),
        cellId: z.string().optional(),
        points: z.number().min(0, "Points must be greater than or equal to 0").max(Number(formData.get('maxPoints')), "Points must be less than or equal to the maximum points for this criteria."),
        description: z.string().min(1, "Description must not be empty").max(255, "Description must be less than 50 characters"),
    });

    const result = cellZ.safeParse({
        lessonId: formData.get('lessonId') as string,
        criteriaId: formData.get('criteriaId') as string,
        cellId: formData.get('cellId') as string,
        points: Number(formData.get('points')),
        description: formData.get('description') as string,
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    const samePointsCell = await prisma.lessonRubricCell.count({
        where: {
            criteriaId: result.data.criteriaId,
            points: result.data.points,
            NOT: {
                id: {
                    equals: result.data.cellId,
                },
            },
        },
    });

    if (samePointsCell > 0) {
        return {errors: [{message: "A cell with the same points already exists for this criteria.  You can add an OR to the description if there are multiple ways to earn the same points."}]};
    }

    if (result.data.cellId) {
        const criteriaCell = await prisma.lessonRubricCell.update({
            where: {
                id: result.data.cellId,
            },
            data: {
                points: result.data.points,
                description: result.data.description,
            },
            include: {
                criteria: true
            },
        });

        await log("UPDATE", "LESSON_RUBRIC", `Updated criteria cell (${criteriaCell.points}) for ${criteriaCell.criteria.criteria}`)

        revalidatePath(`/training/lessons/`, "layout");

        return {criteriaCell};
    } else {
        const criteriaCell = await prisma.lessonRubricCell.create({
            data: {
                points: result.data.points,
                description: result.data.description,
                criteria: {
                    connect: {
                        id: result.data.criteriaId,
                    },
                },
            },
            include: {
                criteria: true,
            },
        });

        await log("CREATE", "LESSON_RUBRIC", `Created criteria cell (${criteriaCell.points}) for ${criteriaCell.criteria.criteria}`)

        revalidatePath(`/training/lessons/`, "layout");

        return {criteriaCell};
    }
}

export const deleteLessonCriteriaCell = async (cellId: string) => {
    const cell = await prisma.lessonRubricCell.delete({
        where: {
            id: cellId,
        },
        include: {
            criteria: {
                include: {
                    rubric: {
                        include: {
                            Lesson: true,
                        },
                    },
                }
            }
        },
    });

    await log("DELETE", "LESSON_RUBRIC", `Deleted criteria cell (${cell.points}) for ${cell.criteria.criteria}`);

    revalidatePath(`/training/lessons/`, "layout");

    return {cell};
}