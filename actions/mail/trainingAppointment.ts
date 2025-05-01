'use server';

import {TrainingAppointment} from "@prisma/client";
import {User} from "next-auth";
import {FROM_EMAIL, mailTransport} from "@/lib/email";
import {appointmentScheduled} from "@/templates/TrainingAppointment/AppointmentScheduled";
import {appointmentUpdated} from "@/templates/TrainingAppointment/AppointmentUpdated";
import {appointmentCanceled} from "@/templates/TrainingAppointment/AppointmentCanceled";
import {appointmentWarning} from "@/templates/TrainingAppointment/AppointmentWarning";
import {appointmentCanceledTrainer} from "@/templates/TrainingAppointment/AppointmentCanceledTrainer";

export const sendTrainingAppointmentScheduledEmail = async (trainingAppointment: TrainingAppointment, student: User, trainer: User) => {
    const {html} = await appointmentScheduled(trainingAppointment, student, trainer);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "Training Appointment Scheduled",
        html,
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

export const sendTrainingAppointmentUpdatedEmail = async (trainingAppointment: TrainingAppointment, student: User, trainer: User) => {
    const {html} = await appointmentUpdated(trainingAppointment, student, trainer);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "Training Appointment Updated",
        html,
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