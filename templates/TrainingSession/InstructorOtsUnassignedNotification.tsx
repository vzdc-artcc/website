import {User} from "next-auth";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";

export const instructorOtsUnassignedNotification = (student: User, instructor: User) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={instructor} headerText="OTS Assignment Removed">
            <p>Your assignment to perform the OTS for {student.fullName} has been removed.</p>
            <p>Contact the Training Administrator if you have any questions.</p>
            <br/>
            <p>Regards,</p>
            <p>Training Administrator</p>
            <p>ta@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    )
}