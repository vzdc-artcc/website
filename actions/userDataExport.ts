'use server';

import prisma from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {log} from "@/actions/log";
import {Prisma} from "@/generated/prisma/client";
import {after} from "next/server";

export type EventAttendance = 'UPCOMING' | 'CONNECTED' | 'NO_SHOW';

const userInclude = {
    log: {
        include: {
            months: {orderBy: [{year: 'asc'}, {month: 'asc'}]},
            positions: {orderBy: {start: 'asc'}},
        },
    },
    eventPositions: {
        include: {event: true},
    },
    certifications: {include: {certificationType: true}},
    soloCertifications: {include: {certificationType: true}},
    loas: {orderBy: {start: 'asc'}},
    dossier: {include: {writer: true}, orderBy: {timestamp: 'asc'}},
    givenFeedback: {orderBy: {submittedAt: 'asc'}},
    incidentReports: {orderBy: {timestamp: 'asc'}},
    incidentsReported: {orderBy: {timestamp: 'asc'}},
    trainingSessions: {
        include: {
            instructor: true,
            tickets: {include: {lesson: true}},
        },
        orderBy: {start: 'asc'},
    },
    trainingSessionsGiven: {orderBy: {start: 'asc'}},
    trainingAppointmentStudent: {include: {trainer: true, lessons: true}, orderBy: {start: 'asc'}},
    trainingAssignmentStudent: {include: {primaryTrainer: true, otherTrainers: true}},
    trainingAssignmentRequestStudent: true,
    trainerReleaseRequestStudent: true,
    trainingProgression: true,
    studentOtsRec: {include: {assignedInstructor: true}},
    visitorApplication: true,
    staffingRequests: true,
    suaBlocks: true,
} satisfies Prisma.UserInclude;

const displayName = (user?: { firstName: string | null, lastName: string | null, cid: string } | null) =>
    user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() + ` (${user.cid})` : null;

const minutesBetween = (start: Date, end: Date) => Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));

export const exportUserData = async (cid: string) => {
    const session = await getServerSession(authOptions);

    if (!session || (!session.user.staffPositions.includes("WM") && !session.user.roles.includes("WEB_TEAM"))) {
        return {error: 'You do not have permission to perform this action.'};
    }

    const user = await prisma.user.findUnique({
        where: {cid: cid.trim()},
        include: userInclude,
    });

    if (!user) {
        return {error: `No user found with CID ${cid}.`};
    }

    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

    // Signups, self cancellations and self edits are never written to the audit log, and deleted signups are
    // hard-deleted, so staff actions that mention the user are the only trace of positions that no longer exist.
    const auditLog = await prisma.log.findMany({
        where: {
            OR: [
                {userId: user.id},
                {message: {contains: user.cid}},
                ...(name ? [{message: {contains: name, mode: 'insensitive' as const}}] : []),
            ],
        },
        include: {user: true},
        orderBy: {timestamp: 'asc'},
    });

    const now = new Date();
    const controllerSessions = user.log?.positions ?? [];

    const eventSignups = user.eventPositions
        .sort((a, b) => a.event.start.getTime() - b.event.start.getTime())
        .map((position) => {
            const slotPosition = position.finalPosition || position.requestedPosition;
            const slotStart = position.finalStartTime || position.requestedStartTime;
            const slotEnd = position.finalEndTime || position.requestedEndTime;

            const overlapping = controllerSessions.filter((s) => s.start < slotEnd && (s.end ?? now) > slotStart);
            const minutesConnected = overlapping.reduce((sum, s) => {
                const start = s.start > slotStart ? s.start : slotStart;
                const end = (s.end ?? now) < slotEnd ? (s.end ?? now) : slotEnd;
                return sum + minutesBetween(start, end);
            }, 0);

            const attendance: EventAttendance = position.event.end > now ? 'UPCOMING' : overlapping.length > 0 ? 'CONNECTED' : 'NO_SHOW';

            return {
                event: position.event.name,
                eventId: position.event.id,
                eventType: position.event.type,
                eventStart: position.event.start,
                eventEnd: position.event.end,
                eventArchived: !!position.event.archived,
                submittedAt: position.submittedAt,
                requestedPosition: position.requestedPosition,
                requestedSecondaryPosition: position.requestedSecondaryPosition,
                requestedStartTime: position.requestedStartTime,
                requestedEndTime: position.requestedEndTime,
                notes: position.notes,
                manuallyAssignedByStaff: !!position.notes?.includes('(MAN ASSIGN)'),
                finalPosition: position.finalPosition,
                finalStartTime: position.finalStartTime,
                finalEndTime: position.finalEndTime,
                finalNotes: position.finalNotes,
                published: position.published,
                controllingCategory: position.controllingCategory,
                isInstructor: position.isInstructor,
                isSolo: position.isSolo,
                isOts: position.isOts,
                isTmu: position.isTmu,
                isCic: position.isCic,
                slotPosition,
                slotStart,
                slotEnd,
                slotMinutes: minutesBetween(slotStart, slotEnd),
                attendance,
                minutesConnectedInSlot: minutesConnected,
                callsignsUsed: [...new Set(overlapping.map((s) => s.position))].join(', '),
            };
        });

    const {
        log: controllerLog,
        eventPositions,
        dossier,
        trainingSessions,
        trainingAppointmentStudent,
        trainingAssignmentStudent,
        studentOtsRec,
        ...profile
    } = user;

    after(async () => {
        await log("CREATE", "USER", `Generated data export for ${displayName(user)}`);
    });

    return {
        data: {
            generatedAt: now,
            generatedBy: displayName(session.user),
            notes: [
                'Event signups that were cancelled or deleted are removed from the database and cannot be listed. Staff deletions only appear in the audit log, by name and timestamp.',
                'Signing up, cancelling and editing a signup by the controller themselves is not written to the audit log.',
                'Attendance compares the final (or requested, if no final) slot times with VATSIM connections recorded by the stats sync. NO_SHOW means no connection overlapped the slot at all.',
            ],
            profile,
            eventSignups,
            auditLog: auditLog.map((entry) => ({
                timestamp: entry.timestamp,
                type: entry.type,
                model: entry.model,
                relation: entry.userId === user.id ? 'BY_USER' : 'ABOUT_USER',
                actor: displayName(entry.user),
                message: entry.message,
            })),
            controllerSessions: controllerSessions.map((s) => ({
                position: s.position,
                facility: s.facility,
                start: s.start,
                end: s.end,
                active: s.active,
                minutes: minutesBetween(s.start, s.end ?? now),
            })),
            controllerHoursByMonth: controllerLog?.months.map(({id, logId, ...month}) => month) ?? [],
            dossier: dossier.map((entry) => ({
                timestamp: entry.timestamp,
                writer: displayName(entry.writer),
                message: entry.message,
            })),
            trainingSessions: trainingSessions.map(({instructor, tickets, ...trainingSession}) => ({
                ...trainingSession,
                instructor: displayName(instructor),
                tickets: tickets.map((ticket) => ({
                    lesson: `${ticket.lesson.identifier} - ${ticket.lesson.name}`,
                    passed: ticket.passed,
                })),
            })),
            trainingAppointments: trainingAppointmentStudent.map(({trainer, lessons, ...appointment}) => ({
                ...appointment,
                trainer: displayName(trainer),
                lessons: lessons.map((lesson) => `${lesson.identifier} - ${lesson.name}`),
            })),
            trainingAssignment: trainingAssignmentStudent && {
                primaryTrainer: displayName(trainingAssignmentStudent.primaryTrainer),
                otherTrainers: trainingAssignmentStudent.otherTrainers.map(displayName),
            },
            otsRecommendations: studentOtsRec.map(({assignedInstructor, ...rec}) => ({
                ...rec,
                assignedInstructor: displayName(assignedInstructor),
            })),
        },
    };
}
