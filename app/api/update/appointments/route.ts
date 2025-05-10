import prisma from "@/lib/db";
import {updateSyncTime} from "@/actions/lib/sync";

const TRAINING_ENVIRONMENTS = process.env.TRAINING_ENVIRONMENTS?.split(",") || ["CHECK CONFIG"];
const BUFFER_TIME = 15; // in minutes

export async function GET() {

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
    }[] = appointments.map((appointment) => {
        const duration = appointment.lessons.map(l => l.duration).reduce((a, b) => a + b, 0);
        return {
            id: appointment.id,
            start: appointment.start,
            duration,
            environment: appointment.environment || undefined,
            liveTraining: appointment.lessons.every(lesson => lesson.location === 1),
        };
    });

    const previousAssignments: string[] = [];

    const appointmentUpdateDetails: {
        id: string,
        environment: string,
        doubleBooking: boolean,
    }[] = []

    for (const appointment of appointmentDetails) {

        if (appointment.liveTraining) {
            appointmentUpdateDetails.push({
                id: appointment.id,
                environment: "LIVE",
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

    await updateSyncTime({appointments: new Date()});

    return Response.json({ok: true,});
}