import {User} from "next-auth";
import {TrainingProgression} from "@/generated/prisma/client";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";

export const progressionAssigned = async (student: User, progression: TrainingProgression) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={student} headerText="Training Progression Assigned">
                <p>Your training progression has been updated to <b>{progression.name}</b>.</p>
            <br/>
            <p>This can happen for the following reasons:</p>
            <p>You completed a progression and the next one was automatically assigned.</p>
            <p>A staff member manually assigned this progression to you.</p>
                <p>You accepted a visitor application or recently logged in as a home controller for the first time.</p>
            <br/>
            <p>Your new progression is available on <a href="https://vzdc.org/profile/overview">your profile</a>.</p>
            <p>If you have any questions, contact the training team.</p>
            <br/>
            <p>Regards,</p>
            <p>The vZDC Training Team</p>
            <p>training@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    )
}