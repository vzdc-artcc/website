import {TrainingAppointment} from "@prisma/client";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";
import {formatEasternDate} from "@/lib/date";
import {getRating} from "@/lib/vatsim";
import {User} from "next-auth";

export const appointmentWarning = async (trainingAppointment: TrainingAppointment, student: User, trainer: User) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={student} headerText="Training Appointment Soon">
            <p>This is a reminder about your training appointment scheduled
                on <b>{formatEasternDate(trainingAppointment.start)}</b> (ET).</p>
            <p>You are required to attend this appointment unless you contact your trainer prior to the start time.</p>
            <br/>
            {!trainingAppointment.preparationCompleted && <>
                <p>
                    Our records indicate that you have not completed the preparation for this appointment. <b>Ensure you
                    have
                    completed the preparation and read all supplemental materials prior to the start time.</b>
                </p>
                <br/>
            </>}
            <p>Failure to appear for an appointment or making last minute changes to an appointment <b>may result in
                disciplinary action</b> in accordance with the Training Order found in the <a
                href="https://vzdc.org/publications/downloads">publications section</a> of the website.</p>
            <br/>
            <p>Contact the trainer if you have any questions about this appointment.</p>
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