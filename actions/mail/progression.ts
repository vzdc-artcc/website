'use server';

import {TrainingProgression} from "@/generated/prisma/client";
import {User} from "next-auth";
import {progressionAssigned} from "@/templates/TrainingProgression/ProgressionAssigned";
import {FROM_EMAIL, mailTransport} from "@/lib/email";
import {progressionRemoved} from "@/templates/TrainingProgression/ProgressionRemoved";

export const sendProgressionAssignedEmail = async (student: User, progression: TrainingProgression) => {

    const {html} = await progressionAssigned(student, progression);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "Training Progression Assigned",
        html,
    });
}

export const sendProgressionRemovedEmail = async (student: User) => {

    const {html} = await progressionRemoved(student);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "Training Progression Removed",
        html,
    });
}