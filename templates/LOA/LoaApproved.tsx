import {User} from "next-auth";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";
import {LOA} from "@/generated/prisma/client";
import {formatZuluDate} from "@/lib/date";

export const loaApproved = (controller: User, loa: LOA) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={controller} headerText="L.O.A. Request Approved">
            <p>Congratulations! Your L.O.A. request has been approved by staff
                until <strong>{formatZuluDate(loa.end)}</strong>.</p>
            <p>If you control at any time
                between <strong>{formatZuluDate(loa.start)}</strong> and <strong>{formatZuluDate(loa.end)}</strong>,
                your L.O.A. will be automatically cancelled without email notice.</p>
            <p>You can modify or delete your L.O.A. on your <a href={`https://vzdc.org/profile/overview`}>profile
                page</a> at any time.</p>
            <br/>
            <p>Regards,</p>
            <p>The vZDC Staff</p>
            <p>staff@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    )
}