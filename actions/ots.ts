'use server';

import {User} from "next-auth";
import prisma from "@/lib/db";
import {
    sendInstructorOtsAssignedNotificationEmail,
    sendInstructorOtsUnassignedNotificationEmail,
    sendOtsRecDeletedEmail,
    sendStudentOtsAssignedNotificationEmail,
    sendStudentOtsRecNotificationEmail,
    sendStudentOtsUnassignedNotificationEmail
} from "@/actions/mail/training";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";

export const assignOts = async (id: string, instructor?: User) => {
    const oldRec = await prisma.otsRecommendation.findUnique({
        where: {id},
        include: {
            student: true,
            assignedInstructor: true,
        },
    });

    const rec = await prisma.otsRecommendation.update({
        data: {
            assignedInstructorId: instructor?.id || null,
        },
        where: {id},
        include: {
            student: true,
        },
    });

    revalidatePath('/training/ots');
    if (!instructor) {
        await log("UPDATE", "OTS_RECOMMENDATION", `Unassigned OTS Recommendation for ${rec.student.fullName}`);
        sendStudentOtsUnassignedNotificationEmail(rec.student as User).then();
        if (oldRec?.assignedInstructorId) {
            sendInstructorOtsUnassignedNotificationEmail(rec.student as User, oldRec.assignedInstructor as User).then();
        }
        return;
    }

    await log("UPDATE", "OTS_RECOMMENDATION", `Assigned OTS Recommendation for ${rec.student.fullName} to instructor ${instructor.fullName}`);
    sendStudentOtsAssignedNotificationEmail(rec.student as User, instructor).then();
    sendInstructorOtsAssignedNotificationEmail(rec.student as User, instructor).then();
    if (oldRec?.assignedInstructorId && oldRec.assignedInstructorId !== instructor.id) {
        sendInstructorOtsUnassignedNotificationEmail(rec.student as User, oldRec.assignedInstructor as User).then();
    }
}

export const manualCreateOtsRec = async (student: User, notes: string) => {
    const rec = await prisma.otsRecommendation.create({
        data: {
            studentId: student.id,
            notes,
        },
    });

    await log("CREATE", "OTS_RECOMMENDATION", `Manually created OTS Recommendation for ${student.fullName}`);
    sendStudentOtsRecNotificationEmail(student, rec).then();
    revalidatePath('/training/ots');
}

export const deleteOtsRec = async (id: string) => {
    const rec = await prisma.otsRecommendation.delete({
        where: {id},
        include: {
            student: true,
        },
    });

    revalidatePath('/training/ots');
    await log("DELETE", "OTS_RECOMMENDATION", `Deleted OTS Recommendation for ${rec.student.fullName}`);
    sendOtsRecDeletedEmail(rec.student as User).then();
}