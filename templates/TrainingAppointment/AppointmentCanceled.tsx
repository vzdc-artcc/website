import {TrainingAppointment} from "@prisma/client";
import React from "react";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";
import {renderReactToMjml} from "@/actions/mjml";
import {formatZuluDate} from "@/lib/date";
import {getRating} from "@/lib/vatsim";
import {User} from "next-auth";

export const appointmentCanceled = async (trainingAppointment: TrainingAppointment, student: User, trainer: User) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={student} headerText="Training Appointment Canceled">
            <p>Your training appointment on <b>{formatZuluDate(trainingAppointment.start)}</b> has been canceled.</p>
            <p>You are no longer required to attend this appointment.</p>
            <br/>
            <p>Contact your trainer if you have any questions.</p>
            <br/>
            <p>Regards,</p>
            <p>{trainer.fullName}</p>
            <p>{getRating(trainer.rating)} - vZDC Training Team</p>
            <p>training@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    );
}