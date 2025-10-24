'use server';

import {TrainingAppointment} from "@prisma/client";
import {User} from "next-auth";
import {FROM_EMAIL, mailTransport} from "@/lib/email";
import {appointmentScheduled} from "@/templates/TrainingAppointment/AppointmentScheduled";
import {appointmentUpdated} from "@/templates/TrainingAppointment/AppointmentUpdated";
import {appointmentCanceled} from "@/templates/TrainingAppointment/AppointmentCanceled";
import {appointmentWarning} from "@/templates/TrainingAppointment/AppointmentWarning";
import {appointmentCanceledTrainer} from "@/templates/TrainingAppointment/AppointmentCanceledTrainer";
import {createEvent} from "ics";

export const sendTrainingAppointmentScheduledEmail = async (trainingAppointment: TrainingAppointment, student: User, trainer: User, duration: number) => {
    const {html} = await appointmentScheduled(trainingAppointment, student, trainer);

    const event = {
        start: trainingAppointment.start.getTime(),
        duration: {minutes: duration},
        title: `Training Appointment with ${trainer.fullName}`,
    };

    const {error, value} = createEvent(event);
    if (error) throw new Error(`Failed to create ICS file: ${error.message}`);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: FROM_EMAIL,
        bcc: [student.email, trainer.email].join(','),
        subject: "Training Appointment Scheduled",
        html,
        attachments: [
            {
                filename: "training-appointment.ics",
                content: value,
                contentType: "text/calendar",
            },
        ],
    })
}

export const sendTrainingAppointmentWarningEmail = async (trainingAppointment: TrainingAppointment, student: User, trainer: User) => {
    const {html} = await appointmentWarning(trainingAppointment, student, trainer);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "REMINDER - Training Appointment Scheduled",
        html,
    })
}

export const sendTrainingAppointmentUpdatedEmail = async (trainingAppointment: TrainingAppointment, student: User, trainer: User, duration: number) => {
    const {html} = await appointmentUpdated(trainingAppointment, student, trainer);

    const event = {
        start: trainingAppointment.start.getTime(),
        duration: {minutes: duration},
        title: `Training Appointment with ${trainer.fullName}`,
    };

    const {error, value} = createEvent(event);
    if (error) throw new Error(`Failed to create ICS file: ${error.message}`);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: FROM_EMAIL,
        bcc: [student.email, trainer.email].join(','),
        subject: "Training Appointment Updated",
        html,
        attachments: [
            {
                filename: "training-appointment.ics",
                content: value,
                contentType: "text/calendar",
            },
        ],
    })
}

export const sendTrainingAppointmentCanceledEmail = async (trainingAppointment: TrainingAppointment, student: User, trainer: User) => {
    const {html} = await appointmentCanceled(trainingAppointment, student, trainer);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "Training Appointment Canceled",
        html,
    })
}

export const sendTrainingAppointmentCancelledTrainerEmail = async (trainingAppointment: TrainingAppointment, student: User, trainer: User) => {
    const {html} = await appointmentCanceledTrainer(trainingAppointment, student, trainer);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: trainer.email,
        subject: "Training Appointment Canceled",
        html,
    })
}