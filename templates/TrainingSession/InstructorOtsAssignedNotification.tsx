import {User} from "next-auth";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";

export const instructorOtsAssignedNotification = (student: User, instructor: User) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={instructor} headerText="OTS Assignment">
            <p>You have been assigned to perform the OTS for <strong>{student.fullName}</strong>.</p>
            <p>You may reach out to the trainee by email or using Discord: {student.email}</p>
            <br/>
            <p>Regards,</p>
            <p>Training Administrator</p>
            <p>ta@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    )
}