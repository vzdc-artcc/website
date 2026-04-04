'use server';

import {User} from "next-auth";
import {FROM_EMAIL, mailTransport} from "@/lib/email";
import {ChangeBroadcast} from "@/generated/prisma/client";
import {broadcastPosted} from "@/templates/Broadcast/BroadcastPosted";

export const sendBroadcastPostedEmail = async (broadcast: ChangeBroadcast, users: User[]) => {

    const {html} = await broadcastPosted(broadcast);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: FROM_EMAIL,
        bcc: users.map(user => user.email).join(','),
        subject: `Broadcast: ${broadcast.title}`,
        html,
    });
}