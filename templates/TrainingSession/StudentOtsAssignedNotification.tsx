import {User} from "next-auth";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";

export const studentOtsAssignedNotification = (student: User, instructor: User) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={student} headerText="OTS Assignment">
            <p><strong>{instructor.fullName}</strong> has been assigned to perform your OTS.</p>
            <p>The instructor will reach out to you directly either via email or Discord.</p>
            <br/>
            <p>Good Luck!</p>
            <p>The vZDC Training Team</p>
            <p>training@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    )
}