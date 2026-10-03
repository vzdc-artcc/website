'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";

export const createOrUpdateLessonRubricCriteria = async (formData: FormData) => {
    const criteriaZ = z.object({
        lessonId: z.string(),
        rubricCriteriaId: z.string().optional(),
        rubricId: z.string().optional(),
        criteria: z.string().min(1, "Name is required").max(255, "Name is too long"),
        maxPoints: z.number().min(1, "Maximum points must be greater than or equal to 1"),
        passing: z.number().min(0, "Passing points must be greater than or equal to 0"),
        description: z.string().min(1, "Description is required"),
    });

    const result = criteriaZ.safeParse({
        lessonId: formData.get('lessonId') as string,
        rubricCriteriaId: formData.get('rubricCriteriaId') as string,
        rubricId: formData.get('rubricId') as string,
        criteria: formData.get('criteria') as string,
        maxPoints: Number(formData.get('maxPoints')),
        passing: Number(formData.get('passing')),
        description: formData.get('description') as string,
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    if (result.data.rubricCriteriaId) {
        const rubricCriteria = await prisma.lessonRubricCriteria.update({
            where: {
                id: result.data.rubricCriteriaId,
            },
            data: {
                criteria: result.data.criteria,
                maxPoints: result.data.maxPoints,
                passing: result.data.passing,
                description: result.data.description,
            },
            include: {
                rubric: {
                    include: {
                        Lesson: true,
                    }
                }
            }
        });

        await log("UPDATE", "LESSON_RUBRIC", `Updated rubric criteria ${rubricCriteria.criteria} from lesson ${rubricCriteria.rubric.Lesson?.identifier}`)

        revalidatePath(`/training/lessons/`, "layout");

        return {rubricCriteria};
    } else {
        const rubricCriteria = await prisma.lessonRubricCriteria.create({
            data: {
                criteria: result.data.criteria,
                maxPoints: result.data.maxPoints,
                passing: result.data.passing,
                description: result.data.description,
                rubric: {
                    connectOrCreate: {
                        create: {
                            Lesson: {
                                connect: {
                                    id: result.data.lessonId,
                                },
                            },
                        },
                        where: {
                            id: result.data.rubricId,
                        },
                    }
                },
            },
            include: {
                rubric: {
                    include: {
                        Lesson: true,
                    }
                }
            }
        });

        await log("CREATE", "LESSON_RUBRIC", `Created rubric criteria ${rubricCriteria.criteria} for lesson ${rubricCriteria.rubric.Lesson?.identifier}`)

        revalidatePath(`/training/lessons/`, "layout");

        return {rubricCriteria};
    }

}

export const deleteLessonRubricCriteria = async (id: string) => {
    const criteria = await prisma.lessonRubricCriteria.delete({
        where: {
            id,
        },
        include: {
            rubric: {
                include: {
                    Lesson: true,
                }
            },
        }
    });

    await log("DELETE", "LESSON_RUBRIC", `Deleted rubric criteria ${criteria.criteria} from lesson ${criteria.rubric.Lesson?.identifier}`);

    revalidatePath(`/training/lessons/`, "layout");
}