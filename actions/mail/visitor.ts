'use server';

import {User} from "next-auth";
import {FROM_EMAIL, mailTransport} from "@/lib/email";
import {visitorAccepted} from "@/templates/Visitor/VisitorAccepted";
import {VisitorApplication} from "@/generated/prisma/client";
import {visitorRejected} from "@/templates/Visitor/VisitorRejected";

export const sendVisitorApplicationAcceptedEmail = async (user: User) => {

    const {html} = await visitorAccepted(user);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: user.email,
        subject: "Visitor Application Accepted",
        html,
    });
}

export const sendVisitorApplicationRejectedEmail = async (user: User, application: VisitorApplication) => {

    const {html} = await visitorRejected(user, application);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: user.email,
        subject: "Visitor Application Rejected",
        html,
    });
}