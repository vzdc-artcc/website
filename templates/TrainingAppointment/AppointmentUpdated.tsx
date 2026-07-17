import {renderReactToMjml} from "@/actions/mjml";
import {TrainingAppointment} from "@/generated/prisma/client";
import {User} from "next-auth";
import {formatTimezoneDate} from "@/lib/date";
import MultipleRecipientsEmailWrapper from "@/templates/Wrapper/MultipleRecipientsEmailWrapper";

export const appointmentUpdated = async (trainingAppointment: TrainingAppointment, student: User, trainer: User, additionalTrainers: User[]) => {
    return renderReactToMjml(
        <MultipleRecipientsEmailWrapper headerText="Training Appointment Updated">
            <p>Dear Student and Trainer,</p>
            <br/>
            <p>Your training appointment
                on <b>{formatTimezoneDate(trainingAppointment.start, student.timezone)}</b> ({student.timezone}) has
                been updated.
            </p>
            <p>Trainer start
                time: <b>{formatTimezoneDate(trainingAppointment.start, student.timezone)}</b> ({student.timezone})</p>
            <p>Primary Trainer: <b>{trainer.fullName}</b></p>
            <p>Additional Trainer(s): <b>{additionalTrainers.map((t) => t.fullName).join(", ")}</b></p>
            <p>Make sure you are familiar with the updates prior to the start time.</p>
            <br/>
            <p>Please check <a href="https://vzdc.org/profile/overview">your profile</a> for more details.</p>
            <br/>
            <p>A copy of this email has been sent to the trainers</p>
            <br/>
            <p>Regards,</p>
            <p>The vZDC Training Team</p>
            <p>training@vzdc.org</p>
        </MultipleRecipientsEmailWrapper>
    );
}