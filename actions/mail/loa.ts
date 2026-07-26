'use server';

import {User} from "next-auth";
import {FROM_EMAIL, mailTransport} from "@/lib/email";
import {loaExpired} from "@/templates/LOA/LoaExpired";

// sendLoaApprovedEmail/sendLoaDeniedEmail/sendLoaDeletedEmail were dropped
// once approve/deny/self-cancel moved to osmium (which doesn't send LOA
// email itself) — an accepted gap, same "email side effects not ported"
// precedent as Training appointments and SUA requests elsewhere in this
// migration. Only the expiration email survives, since deleteExpiredLoas
// (actions/loa.ts) is still Prisma-backed for now.
export const sendLoaExpiredEmail = async (controller: User) => {

    const {html} = await loaExpired(controller);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: controller.email,
        subject: "LOA Expired",
        html,
    });
}