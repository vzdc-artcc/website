'use server';

import {FROM_EMAIL, mailTransport} from "@/lib/email";
import {z} from "zod";
import {log} from "@/actions/log";
import {customEmail} from "@/templates/CustomEmail";

export const sendMail = async (to: string[], subject: string, replyTo: string, body: string) => {

    const emailZ = z.object({
        to: z.string().array().min(1, "At least one recipient is required"),
        subject: z.string().min(1, "Subject must not be empty"),
        replyTo: z.email("Reply to must be a valid email address"),
        body: z.string().min(1, "Body is required"),
    });

    const result = emailZ.safeParse({
        to,
        subject,
        replyTo,
        body,
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    try {

        const {html} = await customEmail(subject, body);

        await mailTransport.sendMail({
            from: FROM_EMAIL,
            to: FROM_EMAIL,
            bcc: to.join(','),
            subject,
            html,
            replyTo,
        })
    } catch (e) {
        console.error(e);
        return {errors: [{message: "An error occurred while sending the email"}]};
    }

    await log("CREATE", "EMAIL", `Sent email to ${to.length} recipients with subject ${subject} and reply to ${replyTo}`)

    return {ok: true};
}