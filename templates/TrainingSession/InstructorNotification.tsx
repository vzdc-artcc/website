import {User} from "next-auth";
import {Lesson, TrainingSession} from "@/generated/prisma/client";
import {renderReactToMjml} from "@/actions/mjml";
import MultipleRecipientsEmailWrapper from "@/templates/Wrapper/MultipleRecipientsEmailWrapper";

export const instructorNotification = (student: User, session: TrainingSession, lesson: Lesson) => {
    return renderReactToMjml(
        <MultipleRecipientsEmailWrapper headerText="Training Session Passed">
            <p>Dear Instructors,</p>
            <p><strong>{student.firstName} {student.lastName} ({student.cid})</strong> has passed
                lesson <strong>{lesson.name} ({lesson.identifier})</strong>.</p>
            <p>Quick Links:</p>
            <a href={`https://vzdc.org/training/sessions/${session.id}`}>Training Session</a>
            <br/>
            <a href={`https://vzdc.org/training/controller/${student.cid}`}>Student's Certifications</a>
            <br/>
            <p>You are receiving this email because you are marked as an instructor and this lesson will notify you on
                PASS.</p>
        </MultipleRecipientsEmailWrapper>
    )
}