import {renderReactToMjml} from "@/actions/mjml";
import {TrainingAppointment} from "@prisma/client";
import {User} from "next-auth";
import {formatTimezoneDate} from "@/lib/date";
import {getRating} from "@/lib/vatsim";
import MultipleRecipientsEmailWrapper from "@/templates/Wrapper/MultipleRecipientsEmailWrapper";

export const appointmentUpdated = async (trainingAppointment: TrainingAppointment, student: User, trainer: User) => {
    return renderReactToMjml(
        <MultipleRecipientsEmailWrapper headerText="Training Appointment Updated">
            <p>Dear Student and Trainer,</p>
            <br/>
            <p>Your training appointment
                on <b>{formatTimezoneDate(trainingAppointment.start, student.timezone)}</b> ({student.timezone}) has
                been updated.
            </p>
            <p>Make sure you are familiar with the updates prior to the start time.</p>
            <br/>
            <p>Please check <a href="https://vzdc.org/profile/overview">your profile</a> for more details.</p>
            <br/>
            <p>A copy of this email has been sent to your trainer, {trainer.fullName} - {getRating(trainer.rating)}.</p>
            <br/>
            <p>Regards,</p>
            <p>The vZDC Training Team</p>
            <p>training@vzdc.org</p>
        </MultipleRecipientsEmailWrapper>
    );
}