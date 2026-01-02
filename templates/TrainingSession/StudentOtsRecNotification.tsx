import {User} from "next-auth";
import {OtsRecommendation} from "@prisma/client";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";

export const studentOtsRecNotification = (student: User, rec: OtsRecommendation) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={student} headerText="OTS Recommendation">
            <p>An OTS (Over the shoulder) recommendation has been submitted for you by our training team.</p>
            <p>You will receive an email after an instructor has been assigned to perform your OTS.</p>
            <p>Scheduling of your OTS will be done directly with the instructor.</p>
            <br/>
            <p>Regards,</p>
            <p>The vZDC Training Team</p>
            <p>training@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    )
}