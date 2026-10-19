'use server';

import prisma from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {log} from "@/actions/log";
import {Prisma} from "@/generated/prisma/client";
import {after} from "next/server";

export type EventAttendance = 'UPCOMING' | 'CONNECTED' | 'NO_SHOW';

export type ExportSection = {
    key: string,
    title: string,
    description: string,
    rows: Record<string, unknown>[],
};

const ticketInclude = {
    lesson: true,
    mistakes: true,
    scores: {include: {criteria: true, cell: true}},
} satisfies Prisma.TrainingTicketInclude;

const performanceIndicatorInclude = {
    categories: {
        include: {criteria: {orderBy: {order: 'asc'}}},
        orderBy: {order: 'asc'},
    },
} satisfies Prisma.TrainingSessionPerformanceIndicatorInclude;

// Every relation on User. Accounts, sessions and Discord OAuth states are loaded for metadata only;
// their tokens are never copied into the export.
const userInclude = {
    accounts: true,
    sessions: true,
    DiscordOauthState: true,
    log: {
        include: {
            months: {orderBy: [{year: 'asc'}, {month: 'asc'}]},
            positions: {orderBy: {start: 'asc'}},
        },
    },
    eventPositions: {include: {event: true}},
    opsPlannedEvents: {orderBy: {start: 'asc'}},
    certifications: {include: {certificationType: true}},
    soloCertifications: {include: {certificationType: true}},
    loas: {orderBy: {start: 'asc'}},
    visitorApplication: true,
    staffingRequests: true,
    suaBlocks: {include: {airspace: true}, orderBy: {start: 'asc'}},
    givenFeedback: {include: {pilot: true}, orderBy: {submittedAt: 'asc'}},
    writtenFeedback: {include: {controller: true}, orderBy: {submittedAt: 'asc'}},
    incidentReports: {include: {reporter: true}, orderBy: {timestamp: 'asc'}},
    incidentsReported: {include: {reportee: true}, orderBy: {timestamp: 'asc'}},
    dossier: {include: {writer: true}, orderBy: {timestamp: 'asc'}},
    writtenDossierEntries: {include: {user: true}, orderBy: {timestamp: 'asc'}},
    trainingSessions: {
        include: {
            instructor: true,
            additionalTrainers: {include: {trainer: true}},
            tickets: {include: ticketInclude},
            performanceIndicator: {include: performanceIndicatorInclude},
        },
        orderBy: {start: 'asc'},
    },
    trainingSessionsGiven: {include: {student: true, tickets: {include: {lesson: true}}}, orderBy: {start: 'asc'}},
    trainingSessionAdditionalTrainers: {include: {session: {include: {student: true}}}},
    trainingAppointmentStudent: {
        include: {trainer: true, lessons: true, additionalTrainers: {include: {trainer: true}}},
        orderBy: {start: 'asc'},
    },
    trainingAppointmentTrainer: {include: {student: true, lessons: true}, orderBy: {start: 'asc'}},
    trainingAppointmentAdditionalTrainers: {include: {appointment: {include: {student: true}}}},
    trainingAssignmentStudent: {include: {primaryTrainer: true, otherTrainers: true}},
    trainingAssignmentPrimaryTrainer: {include: {student: true}},
    trainingAssignmentOtherTrainers: {include: {student: true}},
    trainingAssignmentRequestStudent: {include: {interestedTrainers: true}},
    trainingAssignmentRequestInterestedTrainers: {include: {student: true}},
    trainerReleaseRequestStudent: true,
    trainingProgression: true,
    studentOtsRec: {include: {assignedInstructor: true}},
    instructorOtsRec: {include: {student: true}},
    changesSeen: true,
    changesUnseen: true,
    changesAgreed: true,
} satisfies Prisma.UserInclude;

type NamedUser = { firstName: string | null, lastName: string | null, cid: string };

const displayName = (user?: NamedUser | null) =>
    user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() + ` (${user.cid})` : null;

const minutesBetween = (start: Date, end: Date) => Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));

const REDACTED = '[redacted - third party]';

export const exportUserData = async (cid: string, redactThirdParties = true) => {
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

    // Other people named in the subject's records. Staff acting in their role (trainers, dossier writers,
    // audit log actors) are always shown; pilots, reporters and students are hidden when redacting.
    const thirdParty = (other?: NamedUser | null) => redactThirdParties ? (other ? REDACTED : null) : displayName(other);

    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

    // Signups, self cancellations and self edits are never written to the audit log, and deleted signups are
    // hard-deleted, so staff actions that mention the user are the only trace of positions that no longer exist.
    const [auditLog, opsPlanFiles, verificationTokens] = await Promise.all([
        prisma.log.findMany({
            where: {
                OR: [
                    {userId: user.id},
                    {message: {contains: user.cid}},
                    ...(name ? [{message: {contains: name, mode: 'insensitive' as const}}] : []),
                ],
            },
            include: {user: true},
            orderBy: {timestamp: 'asc'},
        }),
        prisma.opsPlanFile.findMany({where: {createdBy: user.id}, include: {event: true}}),
        user.email ? prisma.verificationToken.findMany({where: {identifier: user.email}}) : [],
    ]);

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

    const profile = Object.fromEntries(
        Object.entries(user).filter(([key, value]) => !(key in userInclude) && (value === null || typeof value !== 'object' || value instanceof Date || Array.isArray(value)))
    );

    const sections: ExportSection[] = [
        {
            key: 'profile',
            title: 'Profile',
            description: 'Account details, roster status, roles, linked services and preferences.',
            rows: [{...profile, trainingProgression: user.trainingProgression?.name ?? null}],
        },
        {
            key: 'login_accounts',
            title: 'Linked login accounts',
            description: 'Sign-in providers linked to this account. Access and refresh tokens are not exported.',
            rows: user.accounts.map((a) => ({
                provider: a.provider,
                providerAccountId: a.providerAccountId,
                type: a.type,
                scopes: a.scopes.join(' '),
                tokenExpiresAt: a.expires_at ? new Date(a.expires_at * 1000) : null,
            })),
        },
        {
            key: 'login_sessions',
            title: 'Login sessions',
            description: 'Website sessions on record. Session tokens are not exported.',
            rows: [
                ...user.sessions.map((s) => ({kind: 'Website session', expires: s.expires})),
                ...user.DiscordOauthState.map((s) => ({kind: 'Pending Discord link', expires: s.expiresAt})),
                ...verificationTokens.map((t) => ({kind: 'Email verification', expires: t.expires})),
            ],
        },
        {
            key: 'controller_hours',
            title: 'Controlling hours by month',
            description: 'Monthly hours recorded from the VATSIM network by the statistics sync.',
            rows: user.log?.months.map(({id, logId, ...month}) => month) ?? [],
        },
        {
            key: 'controller_sessions',
            title: 'Controlling sessions',
            description: 'Individual VATSIM controller connections recorded by the statistics sync.',
            rows: controllerSessions.map((s) => ({
                position: s.position,
                facility: s.facility,
                start: s.start,
                end: s.end,
                active: s.active,
                minutes: minutesBetween(s.start, s.end ?? now),
            })),
        },
        {
            key: 'event_signups',
            title: 'Event signups',
            description: 'Event position requests still on record, with attendance compared against VATSIM connections. Cancelled or deleted signups are not kept by the website.',
            rows: eventSignups,
        },
        {
            key: 'events_ops_planned',
            title: 'Events as ops planner',
            description: 'Events where the user is the assigned operations planner.',
            rows: user.opsPlannedEvents.map((e) => ({event: e.name, type: e.type, start: e.start, end: e.end})),
        },
        {
            key: 'ops_plan_files',
            title: 'Ops plan files uploaded',
            description: 'Files the user uploaded to event operations plans.',
            rows: opsPlanFiles.map((f) => ({name: f.name, description: f.description, event: f.event?.name ?? null, createdAt: f.createdAt, updatedAt: f.updatedAt})),
        },
        {
            key: 'certifications',
            title: 'Certifications',
            description: 'Position certifications held.',
            rows: user.certifications.map((c) => ({certification: c.certificationType.name, option: c.certificationOption})),
        },
        {
            key: 'solo_certifications',
            title: 'Solo certifications',
            description: 'Solo certifications issued.',
            rows: user.soloCertifications.map((s) => ({certification: s.certificationType.name, position: s.position, expires: s.expires})),
        },
        {
            key: 'loas',
            title: 'Leaves of absence',
            description: 'Leave of absence requests.',
            rows: user.loas.map(({id, userId, ...loa}) => loa),
        },
        {
            key: 'visitor_application',
            title: 'Visitor application',
            description: 'Application to visit the facility.',
            rows: user.visitorApplication ? [(({id, userId, ...app}) => app)(user.visitorApplication)] : [],
        },
        {
            key: 'staffing_requests',
            title: 'Staffing requests',
            description: 'Staffing requests submitted.',
            rows: user.staffingRequests.map(({id, userId, ...request}) => request),
        },
        {
            key: 'sua_requests',
            title: 'SUA requests',
            description: 'Special use airspace requests submitted.',
            rows: user.suaBlocks.map(({id, userId, airspace, ...block}) => ({
                ...block,
                airspace: airspace.map((a) => `${a.identifier} ${a.bottomAltitude}-${a.topAltitude}`).join(', '),
            })),
        },
        {
            key: 'feedback_received',
            title: 'Feedback received',
            description: 'Pilot feedback about the user as a controller.',
            rows: user.givenFeedback.map((f) => ({
                submittedAt: f.submittedAt,
                controllerPosition: f.controllerPosition,
                pilot: thirdParty(f.pilot),
                pilotCallsign: redactThirdParties ? REDACTED : f.pilotCallsign,
                rating: f.rating,
                comments: f.comments,
                staffComments: f.staffComments,
                status: f.status,
                decidedAt: f.decidedAt,
            })),
        },
        {
            key: 'feedback_submitted',
            title: 'Feedback submitted',
            description: 'Feedback the user submitted as a pilot.',
            rows: user.writtenFeedback.map((f) => ({
                submittedAt: f.submittedAt,
                pilotCallsign: f.pilotCallsign,
                controller: displayName(f.controller),
                controllerPosition: f.controllerPosition,
                rating: f.rating,
                comments: f.comments,
                status: f.status,
                decidedAt: f.decidedAt,
            })),
        },
        {
            key: 'incident_reports_about',
            title: 'Incident reports about the user',
            description: 'Incident reports filed against the user.',
            rows: user.incidentReports.map((r) => ({
                timestamp: r.timestamp,
                reporter: thirdParty(r.reporter),
                reporterCallsign: redactThirdParties ? REDACTED : r.reporterCallsign,
                reporteeCallsign: r.reporteeCallsign,
                reason: r.reason,
                closed: r.closed,
            })),
        },
        {
            key: 'incident_reports_filed',
            title: 'Incident reports filed',
            description: 'Incident reports the user filed.',
            rows: user.incidentsReported.map((r) => ({
                timestamp: r.timestamp,
                reportee: displayName(r.reportee),
                reporterCallsign: r.reporterCallsign,
                reporteeCallsign: r.reporteeCallsign,
                reason: r.reason,
                closed: r.closed,
            })),
        },
        {
            key: 'dossier',
            title: 'Dossier entries about the user',
            description: 'Staff notes on the user\'s record.',
            rows: user.dossier.map((d) => ({timestamp: d.timestamp, writer: displayName(d.writer), message: d.message})),
        },
        {
            key: 'dossier_written',
            title: 'Dossier entries written',
            description: 'Dossier entries the user wrote about others.',
            rows: user.writtenDossierEntries.map((d) => ({timestamp: d.timestamp, about: thirdParty(d.user), message: d.message})),
        },
        {
            key: 'training_sessions',
            title: 'Training sessions received',
            description: 'Training sessions as a student, with lesson results, rubric scores, mistakes and performance indicators.',
            rows: user.trainingSessions.map((s) => ({
                start: s.start,
                end: s.end,
                instructor: displayName(s.instructor),
                additionalTrainers: s.additionalTrainers.map((t) => `${displayName(t.trainer)}: ${t.description}`).join('; '),
                additionalComments: s.additionalComments,
                trainerComments: s.trainerComments,
                vatusaId: s.vatusaId,
                tickets: s.tickets.map((t) => ({
                    lesson: `${t.lesson.identifier} - ${t.lesson.name}`,
                    passed: t.passed,
                    mistakes: t.mistakes.map((m) => m.name),
                    scores: t.scores.map((score) => ({
                        criteria: score.criteria.criteria,
                        points: score.cell.points,
                        description: score.cell.description,
                        passed: score.passed,
                    })),
                })),
                performanceIndicators: s.performanceIndicator?.categories.map((c) => ({
                    category: c.name,
                    criteria: c.criteria.map((cr) => ({name: cr.name, marker: cr.marker, comments: cr.comments})),
                })) ?? [],
            })),
        },
        {
            key: 'training_sessions_given',
            title: 'Training sessions given',
            description: 'Training sessions the user ran as the instructor or as an additional trainer.',
            rows: [
                ...user.trainingSessionsGiven.map((s) => ({
                    role: 'Instructor',
                    start: s.start,
                    end: s.end,
                    student: thirdParty(s.student),
                    lessons: s.tickets.map((t) => t.lesson.identifier).join(', '),
                    trainerComments: redactThirdParties ? REDACTED : s.trainerComments,
                })),
                ...user.trainingSessionAdditionalTrainers.map((t) => ({
                    role: `Additional trainer: ${t.description}`,
                    start: t.session.start,
                    end: t.session.end,
                    student: thirdParty(t.session.student),
                    lessons: '',
                    trainerComments: '',
                })),
            ],
        },
        {
            key: 'training_appointments',
            title: 'Training appointments',
            description: 'Scheduled training appointments as a student or as a trainer.',
            rows: [
                ...user.trainingAppointmentStudent.map((a) => ({
                    role: 'Student',
                    start: a.start,
                    with: displayName(a.trainer),
                    additionalTrainers: a.additionalTrainers.map((t) => displayName(t.trainer)).join(', '),
                    lessons: a.lessons.map((l) => l.identifier).join(', '),
                    environment: a.environment,
                    notes: a.notes,
                })),
                ...user.trainingAppointmentTrainer.map((a) => ({
                    role: 'Trainer',
                    start: a.start,
                    with: thirdParty(a.student),
                    additionalTrainers: '',
                    lessons: a.lessons.map((l) => l.identifier).join(', '),
                    environment: a.environment,
                    notes: redactThirdParties ? REDACTED : a.notes,
                })),
                ...user.trainingAppointmentAdditionalTrainers.map((t) => ({
                    role: `Additional trainer: ${t.description}`,
                    start: t.appointment.start,
                    with: thirdParty(t.appointment.student),
                    additionalTrainers: '',
                    lessons: '',
                    environment: t.appointment.environment,
                    notes: '',
                })),
            ],
        },
        {
            key: 'training_assignments',
            title: 'Training assignments and requests',
            description: 'Trainer assignments, assignment requests and trainer release requests.',
            rows: [
                ...(user.trainingAssignmentStudent ? [{
                    record: 'Assigned trainers (as student)',
                    submittedAt: null,
                    detail: [displayName(user.trainingAssignmentStudent.primaryTrainer), ...user.trainingAssignmentStudent.otherTrainers.map(displayName)].join(', '),
                }] : []),
                ...(user.trainingAssignmentRequestStudent ? [{
                    record: 'Trainer assignment request',
                    submittedAt: user.trainingAssignmentRequestStudent.submittedAt,
                    detail: `Interested trainers: ${user.trainingAssignmentRequestStudent.interestedTrainers.map(displayName).join(', ')}`,
                }] : []),
                ...(user.trainerReleaseRequestStudent ? [{
                    record: 'Trainer release request',
                    submittedAt: user.trainerReleaseRequestStudent.submittedAt,
                    detail: '',
                }] : []),
                ...user.trainingAssignmentPrimaryTrainer.map((a) => ({record: 'Primary trainer for', submittedAt: null, detail: thirdParty(a.student)})),
                ...user.trainingAssignmentOtherTrainers.map((a) => ({record: 'Other trainer for', submittedAt: null, detail: thirdParty(a.student)})),
                ...user.trainingAssignmentRequestInterestedTrainers.map((r) => ({record: 'Interested in training', submittedAt: r.submittedAt, detail: thirdParty(r.student)})),
            ],
        },
        {
            key: 'ots_recommendations',
            title: 'OTS recommendations',
            description: 'Over-the-shoulder exam recommendations as a student or as the assigned instructor.',
            rows: [
                ...user.studentOtsRec.map((r) => ({role: 'Student', createdAt: r.createdAt, with: displayName(r.assignedInstructor), notes: r.notes})),
                ...user.instructorOtsRec.map((r) => ({role: 'Assigned instructor', createdAt: r.createdAt, with: thirdParty(r.student), notes: redactThirdParties ? REDACTED : r.notes})),
            ],
        },
        {
            key: 'change_broadcasts',
            title: 'Change broadcasts',
            description: 'Policy and change announcements and whether the user has seen or agreed to them.',
            rows: [
                ...user.changesAgreed.map((c) => ({title: c.title, published: c.timestamp, status: 'Agreed'})),
                ...user.changesSeen.filter((c) => !user.changesAgreed.some((a) => a.id === c.id)).map((c) => ({title: c.title, published: c.timestamp, status: 'Seen'})),
                ...user.changesUnseen.map((c) => ({title: c.title, published: c.timestamp, status: 'Unseen'})),
            ],
        },
        {
            key: 'audit_log_by_user',
            title: 'Actions taken by the user',
            description: 'Audit log entries for actions the user took on the website.',
            rows: auditLog.filter((l) => l.userId === user.id).map((l) => ({timestamp: l.timestamp, type: l.type, model: l.model, message: l.message})),
        },
        {
            key: 'audit_log_about_user',
            title: 'Staff actions about the user',
            description: 'Audit log entries by others that name the user or their CID.',
            rows: auditLog.filter((l) => l.userId !== user.id).map((l) => ({timestamp: l.timestamp, actor: displayName(l.user), type: l.type, model: l.model, message: l.message})),
        },
    ];

    after(async () => {
        await log("CREATE", "USER", `Generated data export for ${displayName(user)}${redactThirdParties ? '' : ' (third parties not redacted)'}`);
    });

    return {
        data: {
            subject: {cid: user.cid, name, email: user.email},
            generatedAt: now,
            generatedBy: displayName(session.user),
            thirdPartiesRedacted: redactThirdParties,
            notes: [
                'This export covers every record in the website database linked to the user, either directly or by a name or CID mention in the audit log.',
                'Not included: login, session and Discord link tokens (security credentials), and data held outside this database, such as VATSIM and VATUSA records, Discord and TeamSpeak servers, sent emails and uploaded files in UploadThing.',
                'Event signups that are cancelled or deleted are removed from the database, so they cannot be listed. Signups, cancellations and edits made by the user themselves are not written to the audit log.',
                'Attendance compares the final (or requested, if no final) slot times with VATSIM connections recorded by the stats sync. NO_SHOW means no connection overlapped the slot at all.',
                ...(redactThirdParties ? ['Identities of other individuals (pilots, incident reporters, students) and notes written about them are redacted. Staff acting in their role are shown.'] : []),
            ],
            sections,
        },
    };
}
