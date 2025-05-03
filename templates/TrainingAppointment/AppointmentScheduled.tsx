import {TrainingAppointment} from "@prisma/client";
import {User} from "next-auth";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";
import {formatEasternDate} from "@/lib/date";
import {getRating} from "@/lib/vatsim";

export const appointmentScheduled = async (trainingAppointment: TrainingAppointment, student: User, trainer: User) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={student} headerText="Training Appointment Scheduled">
            <p>A training appointment has been scheduled for you
                on <b>{formatEasternDate(trainingAppointment.start)}</b> (ET).
            </p>
            <p>The estimated duration for this appointment can be found on your profile.</p>
            <br/>
            <p><b>Ensure you have completed the preparation and read all supplemental materials prior to the start
                time.</b></p>
            <p>Check the appointment details to view instructions to join your session, and other information.</p>
            <br/>
            <p>Failure to appear for an appointment or making last minute changes to an appointment <b>may result in
                disciplinary action</b> in accordance with the Training Order found in the <a
                href="https://vzdc.org/publications/downloads">publications section</a> of the website.</p>
            <br/>
            <p>Please check <a href="https://vzdc.org/profile/overview">your profile</a> for more details about your
                appointment and to complete the trainee preparation.</p>
            <br/>
            <p>Regards,</p>
            <p>{trainer.fullName}</p>
            <p>{getRating(trainer.rating)} - vZDC Training Team</p>
            <p>training@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    );
}