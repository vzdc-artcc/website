'use server';

import {User} from "next-auth";
import {LOA} from "@/generated/prisma/client";
import {FROM_EMAIL, mailTransport} from "@/lib/email";
import {loaApproved} from "@/templates/LOA/LoaApproved";
import {loaDenied} from "@/templates/LOA/LoaDenied";
import {loaDeleted} from "@/templates/LOA/LoaDeleted";
import {loaExpired} from "@/templates/LOA/LoaExpired";

export const sendLoaApprovedEmail = async (controller: User, loa: LOA) => {

    const {html} = await loaApproved(controller, loa);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: controller.email,
        subject: "L.O.A. Request Approved",
        html,
    });
}

export const sendLoaDeniedEmail = async (controller: User, loa: LOA) => {

    const {html} = await loaDenied(controller, loa);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: controller.email,
        subject: "L.O.A. Request Denied",
        html,
    });
}

export const sendLoaDeletedEmail = async (controller: User) => {

    const {html} = await loaDeleted(controller);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: controller.email,
        subject: "LOA Request Deleted",
        html,
    });
}

export const sendLoaExpiredEmail = async (controller: User) => {

    const {html} = await loaExpired(controller);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: controller.email,
        subject: "LOA Expired",
        html,
    });
}