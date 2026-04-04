import {User} from "next-auth";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";
import {VisitorApplication} from "@/generated/prisma/client";

export const visitorRejected = (user: User, application: VisitorApplication) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={user} headerText="Visitor Application Rejected">
            <p>Unfortunately, you have not been approved to visit vZDC.</p>
            {application.reasonForDenial && <p>Reason for denial: {application.reasonForDenial}</p>}
            <br/>
            <p>If you believe that this was an error, contact vZDC staff.</p>
            <br/>
            <p>Regards,</p>
            <p>The vZDC Staff</p>
            <p>staff@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    )
}