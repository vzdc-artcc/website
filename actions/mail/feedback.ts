'use server';
import {User} from "next-auth";
import {FROM_EMAIL, mailTransport} from "@/lib/email";
import {Feedback} from "@/generated/prisma/client";
import {newFeedback} from "@/templates/Feedback/NewFeedback";

export const sendNewFeedbackEmail = async (controller: User, feedback: Feedback) => {

    const {html} = await newFeedback(controller, feedback);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: controller.email,
        subject: "New Feedback Released",
        html,
    });
}