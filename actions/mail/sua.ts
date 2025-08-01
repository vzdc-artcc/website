'use server';
import {User} from "next-auth";
import {SuaBlock} from "@prisma/client";
import {FROM_EMAIL, mailTransport} from "@/lib/email";
import {missionCreated} from "@/templates/SuaRequest/MissionCreated";

export const sendMissionCreatedEmail = async (controller: User, sua: SuaBlock) => {

    const {html} = await missionCreated(controller, sua);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: controller.email,
        subject: 'SUA Mission Created',
        html,
    });
}