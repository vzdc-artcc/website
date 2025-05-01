import {TrainingAppointment} from "@prisma/client";
import {User} from "next-auth";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";
import {formatZuluDate} from "@/lib/date";

export const appointmentCanceledTrainer = async (trainingAppointment: TrainingAppointment, student: User, trainer: User) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={trainer} headerText="Training Appointment Canceled">
            <p>Your training appointment
                with <b>{student.fullName}</b> on <b>{formatZuluDate(trainingAppointment.start)}</b> has been cancelled
                by staff.</p>
            <p>You are no longer required to attend this appointment.</p>
            <br/>
            <p>There is no need to notify your student, as an email was already sent to them.</p>
            <br/>
            <p>Contact the senior training staff if you have any questions.</p>
            <br/>
            <p>Regards,</p>
            <p>vZDC Senior Training Staff</p>
            <p>training@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    );
}