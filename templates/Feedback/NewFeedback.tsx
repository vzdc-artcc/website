import {User} from "next-auth";
import {Feedback} from "@/generated/prisma/client";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";

export const newFeedback = (controller: User, feedback: Feedback) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={controller} headerText="Feedback Released">
            <p>You have received new feedback; click <a
                href={`https://vzdc.org/profile/feedback/${feedback.id}`}>here</a> to view it.</p>
            <br/>
            <p>Regards,</p>
            <p>The vZDC Staff</p>
            <p>staff@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    )
}