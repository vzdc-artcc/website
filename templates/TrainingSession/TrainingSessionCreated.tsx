import {TrainingSession} from "@/generated/prisma/client";
import {User} from "next-auth";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";

export const trainingSessionCreated = (student: User, trainingSession: TrainingSession) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={student} headerText="New Training Session">
            <p>A new training session was posted for your account.</p>
            <p>Click the link below to view the training session:</p>
            <br/>
            <a href={`https://vzdc.org/profile/training/${trainingSession.id}`}>Training Session</a>
            <br/>
            <p>Regards</p>
            <p>The vZDC Training Team</p>
            <p>training@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    )
}