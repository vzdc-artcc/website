import prisma from "@/lib/db";
import {updateSyncTime} from "@/actions/lib/sync";
import {sendTrainingAppointmentWarningEmail} from "@/actions/mail/trainingAppointment";
import {User} from "next-auth";
import {verifyUpdaterKey} from "@/lib/update";

const TRAINING_ENVIRONMENTS = process.env.TRAINING_ENVIRONMENTS?.split(",") || ["ERR-CONFIG"];
const BUFFER_TIME = Number(process.env.BUFFER_TIME) || 15; // in minutes
const oneWeekInMS = 7 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {

    if (!(await verifyUpdaterKey(req))) {
        return new Response('Unauthorized', {status: 401});
    }

    const appointments = await prisma.trainingAppointment.findMany({
        include: {
            lessons: true,
        },
        orderBy: {
            start: 'asc',
        },
    });

    const appointmentDetails: {
        id: string,
        start: Date,
        duration: number,
        environment?: string,
        liveTraining: boolean,
        classroomTraining: boolean,
    }[] = appointments.map((appointment) => {
        const duration = appointment.lessons.map(l => l.duration).reduce((a, b) => a + b, 0);
        return {
            id: appointment.id,
            start: appointment.start,
            duration,
            environment: appointment.environment || undefined,
            liveTraining: appointment.lessons.every(lesson => lesson.location === 1),
            classroomTraining: appointment.lessons.every(lesson => lesson.location === 0),
        };
    });

    const previousAssignments: string[] = [];

    const appointmentUpdateDetails: {
        id: string,
        environment: string,
        doubleBooking: boolean,
    }[] = []

    for (const appointment of appointmentDetails) {

        if (appointment.start < new Date()) {
            continue;
        }

        if (appointment.liveTraining) {
            appointmentUpdateDetails.push({
                id: appointment.id,
                environment: "LIVE",
                doubleBooking: false,
            });

            continue;
        } else if (appointment.classroomTraining) {
            appointmentUpdateDetails.push({
                id: appointment.id,
                environment: "CLASSROOM",
                doubleBooking: false,
            });

            continue;
        }

        let environmentIdx = 0;
        let environmentAppointment = appointmentDetails.find((a) => a.id === previousAssignments[environmentIdx]);
        let environmentAppointmentEndTime = environmentAppointment ? new Date(environmentAppointment.start.getTime() + ((environmentAppointment.duration + BUFFER_TIME) * 60 * 1000)) : undefined;

        while (environmentAppointment && environmentAppointmentEndTime && appointment.start < environmentAppointmentEndTime) {
            environmentIdx++;
            environmentAppointment = appointmentDetails.find((a) => a.id === previousAssignments[environmentIdx]);
            environmentAppointmentEndTime = environmentAppointment ? new Date(environmentAppointment.start.getTime() + ((environmentAppointment.duration + BUFFER_TIME) * 60 * 1000)) : undefined;
        }

        if (environmentIdx >= TRAINING_ENVIRONMENTS.length) {
            appointmentUpdateDetails.push({
                id: appointment.id,
                environment: "DOUBLE_BOOKED",
                doubleBooking: true,
            });
            continue;
        }

        appointmentUpdateDetails.push({
            id: appointment.id,
            environment: TRAINING_ENVIRONMENTS[environmentIdx],
            doubleBooking: false,
        });

        previousAssignments[environmentIdx] = appointment.id;

    }

    for (const appointment of appointmentUpdateDetails) {
        await prisma.trainingAppointment.update({
            where: {
                id: appointment.id,
            },
            data: {
                environment: appointment.environment,
                doubleBooking: appointment.doubleBooking,
            },
        });
    }

    await deleteOldTrainingAppointments();

    await sendTrainingAppointmentWarningEmails();

    await updateSyncTime({appointments: new Date()});

    return Response.json({ok: true,});
}

const sendTrainingAppointmentWarningEmails = async () => {
    const now = new Date();
    now.setTime(now.getTime() + (1000 * 60 * 60 * 12)); // 12 hours from now
    const trainingAppointments = await prisma.trainingAppointment.findMany({
        where: {
            start: {
                gte: new Date(),
                lte: now,
            },
            warningEmailSent: false,
        },
        include: {
            student: true,
            trainer: true,
        },
    });

    await Promise.all(trainingAppointments.map(async (trainingAppointment) => {
        try {
            await sendTrainingAppointmentWarningEmail(trainingAppointment, trainingAppointment.student as User, trainingAppointment.trainer as User);
            await prisma.trainingAppointment.update({
                where: {
                    id: trainingAppointment.id,
                },
                data: {
                    warningEmailSent: true,
                },
            });
        } catch (error) {
            console.error(error);
        }
    }));
}

const deleteOldTrainingAppointments = async () => {
    const now = new Date();

    const trainingAppointments = await prisma.trainingAppointment.findMany({
        include: {
            lessons: true,
        },
    });

    for (const appointment of trainingAppointments) {
        const totalLessonDurationInMs = appointment.lessons
            .map((lesson) => lesson.duration * 60 * 1000) // Convert minutes to milliseconds
            .reduce((acc, curr) => acc + curr, 0);

        const endTime = new Date(appointment.start.getTime() + totalLessonDurationInMs + oneWeekInMS);

        if (endTime <= now) {
            await prisma.trainingAppointment.delete({
                where: {
                    id: appointment.id,
                },
            });
        }
    }
};