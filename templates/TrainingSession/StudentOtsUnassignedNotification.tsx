import {User} from "next-auth";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";

export const studentOtsUnassignedNotification = (student: User) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={student} headerText="OTS Assignment Removed">
            <p>Your OTS instructor assignment has been removed. Another instructor should be assigned to you
                shortly.</p>
            <p>Contact the Training Administrator if you have any questions.</p>
            <br/>
            <p>Good Luck!</p>
            <p>Training Administrator</p>
            <p>ta@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    )
}