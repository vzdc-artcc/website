import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";
import {User} from "next-auth";
import {LOA} from "@/generated/prisma/client";

export const loaDenied = (controller: User, loa: LOA) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={controller} headerText="L.O.A. Request Denied">
            <p>Your L.O.A. request has been denied.</p>
            {loa.reason && <p>Reason: {loa.reason}</p>}
            <p>Contact staff if you have any questions or believe that this is an error.</p>
            <br/>
            <p>Regards,</p>
            <p>The vZDC Staff</p>
            <p>staff@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    );
}