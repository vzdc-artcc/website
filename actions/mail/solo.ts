'use server';

import {User} from "next-auth";
import {SoloCertification} from "@prisma/client";
import {FROM_EMAIL, mailTransport} from "@/lib/email";
import {soloAdded} from "@/templates/Solo/SoloAdded";
import {soloDeleted} from "@/templates/Solo/SoloDeleted";
import {soloExpired} from "@/templates/Solo/SoloExpired";

export const sendSoloAddedEmail = async (controller: User, solo: SoloCertification) => {

    const {html} = await soloAdded(controller, solo);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: controller.email,
        subject: 'Solo Endorsement Added',
        html,
    });
}

export const sendSoloDeletedEmail = async (controller: User, solo: SoloCertification) => {

    const {html} = await soloDeleted(controller, solo);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: controller.email,
        subject: 'Solo Endorsement Removed',
        html,
    });
}

export const sendSoloExpiredEmail = async (controller: User, solo: SoloCertification) => {

    const {html} = await soloExpired(controller, solo);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: controller.email,
        subject: 'Solo Endorsement Expired',
        html,
    });
}