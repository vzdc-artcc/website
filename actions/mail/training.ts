'use server';

import {Lesson, OtsRecommendation, TrainingSession} from "@prisma/client";
import {User} from "next-auth";
import {FROM_EMAIL, mailTransport} from "@/lib/email";
import {trainingSessionCreated} from "@/templates/TrainingSession/TrainingSessionCreated";
import {instructorNotification} from "@/templates/TrainingSession/InstructorNotification";
import {assignmentFulfilledStudent} from "@/templates/TrainingAssignment/AssignmentFulfilledStudent";
import {assignmentPrimaryTrainer} from "@/templates/TrainingAssignment/AssignmentPrimaryTrainer";
import {assignmentOtherTrainer} from "@/templates/TrainingAssignment/AssignmentOtherTrainer";
import {releaseRequestApprovedStudent} from "@/templates/ReleaseRequest/ReleaseRequestApprovedStudent";
import {assignmentTrainerRemoved} from "@/templates/TrainingAssignment/AssignmentTrainerRemoved";
import {assignmentUpdatedStudent} from "@/templates/TrainingAssignment/AssignmentUpdatedStudent";
import {requestDeleted} from "@/templates/AssignmentRequest/RequestDeleted";
import {studentOtsRecNotification} from "@/templates/TrainingSession/StudentOtsRecNotification";
import {studentOtsAssignedNotification} from "@/templates/TrainingSession/StudentOtsAssignedNotification";
import {instructorOtsAssignedNotification} from "@/templates/TrainingSession/InstructorOtsAssignedNotification";
import {instructorOtsUnassignedNotification} from "@/templates/TrainingSession/InstructorOtsUnassignedNotification";
import {studentOtsUnassignedNotification} from "@/templates/TrainingSession/StudentOtsUnassignedNotification";

export const sendTrainingSessionCreatedEmail = async (student: User, trainingSession: TrainingSession) => {

    const {html} = await trainingSessionCreated(student, trainingSession);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "New Training Session",
        html,
    })
}

export const sendInstructorsTrainingSessionCreatedEmail = async (student: User, trainingSession: TrainingSession, lesson: Lesson) => {

    const {html} = await instructorNotification(student, trainingSession, lesson);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: FROM_EMAIL,
        bcc: 'zdc-instructors@vatusa.net',
        subject: `${lesson.identifier} PASS Notification`,
        html,
    })
}

export const sendStudentOtsRecNotificationEmail = async (student: User, rec: OtsRecommendation) => {
    const {html} = await studentOtsRecNotification(student, rec);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "OTS Recommendation",
        html,
    })
}

export const sendStudentOtsAssignedNotificationEmail = async (student: User, instructor: User) => {
    const {html} = await studentOtsAssignedNotification(student, instructor);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "OTS Assignment",
        html,
    })
}

export const sendStudentOtsUnassignedNotificationEmail = async (student: User) => {
    const {html} = await studentOtsUnassignedNotification(student);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "OTS Assignment Removed",
        html,
    })
}


export const sendInstructorOtsAssignedNotificationEmail = async (student: User, instructor: User) => {
    const {html} = await instructorOtsAssignedNotification(student, instructor);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: instructor.email,
        subject: "OTS Assignment",
        html,
    });
}

export const sendInstructorOtsUnassignedNotificationEmail = async (student: User, instructor: User) => {
    const {html} = await instructorOtsUnassignedNotification(student, instructor);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: instructor.email,
        subject: "OTS Assignment Removed",
        html,
    });
}


export const sendTrainingAssignmentUpdatedEmail = async (student: User, primaryTrainer: User, removedTrainers: User[], addedTrainers: User[], primaryChanged: boolean) => {

    if (removedTrainers.length > 0) {
        const {html: removedTrainersEmail} = await assignmentTrainerRemoved(student);
        await mailTransport.sendMail({
            from: FROM_EMAIL,
            to: FROM_EMAIL,
            bcc: removedTrainers.map(trainer => trainer.email).join(', '),
            subject: "Training Assignment Updated - Trainer Removed",
            html: removedTrainersEmail,
        });
    }

    if (addedTrainers.length > 0) {
        const {html: addedTrainersEmail} = await assignmentOtherTrainer(student, primaryTrainer);
        await mailTransport.sendMail({
            from: FROM_EMAIL,
            to: FROM_EMAIL,
            bcc: addedTrainers.map(trainer => trainer.email).join(', '),
            subject: "Training Assignment Updated - Trainer Added",
            html: addedTrainersEmail,
        });
    }

    if (primaryChanged) {
        const {html: primaryTrainerEmail} = await assignmentPrimaryTrainer(student, primaryTrainer);
        await mailTransport.sendMail({
            from: FROM_EMAIL,
            to: primaryTrainer.email,
            subject: "Training Assignment Updated - Primary Trainer",
            html: primaryTrainerEmail,
        });
    }

    const {html: studentEmail} = await assignmentUpdatedStudent(student);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "Training Assignment Updated",
        html: studentEmail,
    });

};

export const sendTrainingAssignmentDeletedEmail = async (student: User, trainers: User[]) => {

    const {html: studentEmail} = await releaseRequestApprovedStudent(student, true);
    const {html: trainersEmail} = await assignmentTrainerRemoved(student);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "Training Assignment Deleted",
        html: studentEmail,
    });

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: FROM_EMAIL,
        bcc: trainers.map(trainer => trainer.email).join(', '),
        subject: "Training Assignment Released",
        html: trainersEmail,
    });
};

export const sendReleaseRequestApprovedEmail = async (student: User, trainers: User[]) => {

    const {html: studentEmail} = await releaseRequestApprovedStudent(student);
    const {html: trainersEmail} = await assignmentTrainerRemoved(student);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "Release Request Approved",
        html: studentEmail,
    });

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: FROM_EMAIL,
        bcc: trainers.map(trainer => trainer.email).join(', '),
        subject: "Release Request Approved",
        html: trainersEmail,
    });
};

export const sendTrainingRequestFulfilledEmail = async (student: User, primaryTrainer: User, otherTrainers: User[]) => {

    const {html: studentEmail} = await assignmentFulfilledStudent(student, primaryTrainer, otherTrainers);
    const {html: primaryTrainerEmail} = await assignmentPrimaryTrainer(student, primaryTrainer);
    const {html: otherTrainersEmail} = await assignmentOtherTrainer(student, primaryTrainer);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "Training Assignment Fulfilled",
        html: studentEmail,
    });

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: primaryTrainer.email,
        subject: "Training Assignment - Primary",
        html: primaryTrainerEmail,
    });

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: FROM_EMAIL,
        bcc: otherTrainers.map(trainer => trainer.email).join(', '),
        subject: "Training Request Fulfilled",
        html: otherTrainersEmail,
    });
};

export const sendTrainingRequestDeletedEmail = async (student: User) => {

    const {html} = await requestDeleted(student);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: student.email,
        subject: "Training Assignment Request Deleted",
        html,
    });

};