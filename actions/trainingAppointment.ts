'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {revalidatePath} from "next/cache";
import {log} from "@/actions/log";
import {formatZuluDate} from "@/lib/date";

export const createOrUpdateTrainingAppointment = async (studentId: string, start: string, lessonIds: string[], id?: string) => {

    const trainerId = (await getServerSession(authOptions))?.user.id;

    if (!trainerId) {
        return {errors: [{message: 'User not authenticated'}]};
    }

    const isAtLeastOneHourFromNow = (date: Date) => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        return date >= now || !!id;
    }

    const trainingAppointmentZ = z.object({
        id: z.string().optional(),
        studentId: z.string().min(1, {message: "Student is required"}),
        start: z.date({required_error: 'Start date is required'}).refine(isAtLeastOneHourFromNow, {message: "Start date must be at least one hour from now"}),
        lessonIds: z.array(z.string()).min(1, {message: "At least one lesson is required"}).max(5, {message: "A maximum of 5 lessons is allowed"}),
    });

    const result = trainingAppointmentZ.safeParse({
        id,
        studentId,
        start: new Date(start),
        lessonIds,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    if (result.data.id) {
        const ta = await prisma.trainingAppointment.update({
            data: {
                start: result.data.start,
                lessons: {
                    connect: result.data.lessonIds.map((lessonId) => ({id: lessonId})),
                },
            },
            where: {
                id: result.data.id,
            }
        });

        await log("UPDATE", "TRAINING_APPOINTMENT", `Updated training appointment with ${ta.studentId} on ${formatZuluDate(ta.start)}`);
    } else {
        const ta = await prisma.trainingAppointment.create({
            data: {
                trainerId,
                studentId: result.data.studentId,
                start: result.data.start,
                lessons: {
                    connect: result.data.lessonIds.map((lessonId) => ({id: lessonId})),
                },
            },
            include: {
                student: true,
            },
        });

        await log("CREATE", "TRAINING_APPOINTMENT", `Created training appointment with ${ta.student.fullName} on ${formatZuluDate(ta.start)}`);
    }

    revalidatePath('/training/your-students');
    revalidatePath(`/training/appointments`);

    return {};
}

export const deleteTrainingAppointment = async (id: string) => {
    const ta = await prisma.trainingAppointment.delete({
        where: {
            id,
        },
        include: {
            student: true,
        },
    });

    revalidatePath('/training/your-students');
    revalidatePath(`/training/appointments`);

    await log("DELETE", "TRAINING_APPOINTMENT", `Deleted training appointment with ${ta.student.fullName} on ${formatZuluDate(ta.start)}`)
}