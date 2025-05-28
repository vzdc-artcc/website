import {TrainingAppointment} from "@prisma/client";
import {User} from "next-auth";
import {renderReactToMjml} from "@/actions/mjml";
import {formatTimezoneDate} from "@/lib/date";
import {getRating} from "@/lib/vatsim";
import MultipleRecipientsEmailWrapper from "@/templates/Wrapper/MultipleRecipientsEmailWrapper";

export const appointmentScheduled = async (trainingAppointment: TrainingAppointment, student: User, trainer: User) => {
    return renderReactToMjml(
        <MultipleRecipientsEmailWrapper headerText="Training Appointment Scheduled">
            <p>Dear Student and Trainer,</p>
            <br/>
            <p>A training appointment has been scheduled for you
                on <b>{formatTimezoneDate(trainingAppointment.start, student.timezone)}</b> ({student.timezone}).
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
            <p>A copy of this email has been sent to your trainer, {trainer.fullName} - {getRating(trainer.rating)}.</p>
            <br/>
            <p>Regards,</p>
            <p>The vZDC Training Team</p>
            <p>training@vzdc.org</p>
        </MultipleRecipientsEmailWrapper>
    );
}