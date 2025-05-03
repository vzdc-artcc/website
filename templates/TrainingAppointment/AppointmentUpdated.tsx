import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";
import {TrainingAppointment} from "@prisma/client";
import {User} from "next-auth";
import {formatEasternDate} from "@/lib/date";
import {getRating} from "@/lib/vatsim";

export const appointmentUpdated = async (trainingAppointment: TrainingAppointment, student: User, trainer: User) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={student} headerText="Training Appointment Updated">
            <p>Your training appointment on <b>{formatEasternDate(trainingAppointment.start)}</b> (ET) has been updated.
            </p>
            <p>Make sure you are familiar with the updates prior to the start time.</p>
            <br/>
            <p>Please check <a href="https://vzdc.org/profile/overview">your profile</a> for more details.</p>
            <br/>
            <p>Regards,</p>
            <p>{trainer.fullName}</p>
            <p>{getRating(trainer.rating)} - vZDC Training Team</p>
            <p>training@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    );
}