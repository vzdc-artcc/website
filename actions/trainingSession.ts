// noinspection JSPotentiallyInvalidTargetOfIndexedPropertyAccess

'use server';

import prisma from "@/lib/db";
import {log} from "@/actions/log";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {
    CertificationType,
    CommonMistake,
    Lesson,
    LessonRosterChange,
    Prisma,
    RubricCriteraScore,
    TrainerReleaseRequest,
    TrainingSession,
    TrainingTicket
} from "@prisma/client";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import {
    createVatusaTrainingSession,
    deleteVatusaTrainingSession,
    editVatusaTrainingSession
} from "@/actions/vatusa/training";
import {getDuration} from "@/lib/date";
import {sendInstructorsTrainingSessionCreatedEmail, sendTrainingSessionCreatedEmail} from "@/actions/mail/training";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {TrainingSessionIndicatorWithAll} from "@/components/TrainingSession/TrainingSessionForm";
import {after} from "next/server";
import {writeDossier} from "@/actions/dossier";
import {RosterChangeWithAll} from "@/components/TrainingSession/TrainingSessionAfterSubmitDialogs";

type LessonRosterChangeWithType = LessonRosterChange & { certificationType: CertificationType, };
type TrainingTicketWithLesson = TrainingTicket & {
    lesson: Lesson;
}

export async function deleteTrainingSession(id: string) {
    const trainingSession = await prisma.trainingSession.delete({
        where: {id},
        include: {
            student: true,
        }
    });

    await log("DELETE", "TRAINING_SESSION", `Deleted training session with student ${trainingSession.student.cid} - ${trainingSession.student.firstName} ${trainingSession.student.lastName}`);

    await deleteVatusaTrainingSession(trainingSession.vatusaId || '');
    revalidatePath('/training/sessions', "layout");

    return trainingSession;
}

type CreateOrUpdateTrainingSessionResult = {
    release?: TrainerReleaseRequest;
    rosterUpdates?: RosterChangeWithAll[];
    errors?: { message: string }[];
};

export const createOrUpdateTrainingSession = async (
    student: string,
    start: any,
    end: any,
    trainingTickets: {
        lesson: Lesson,
        mistakes: CommonMistake[],
        scores: RubricCriteraScore[],
        passed: boolean,
    }[],
    additionalComments: string,
    trainerComments: string,
    enableMarkdown: boolean,
    performanceIndicator?: TrainingSessionIndicatorWithAll,
    id?: string,
): Promise<CreateOrUpdateTrainingSessionResult> => {

    const trainingSessionZ = z.object({
        id: z.string().optional(),
        student: z.string().min(1, {message: "You must select a student."}),
        start: z.date({required_error: "You must select a start date."}),
        end: z.date({required_error: "You must select an end date."}).refine(end => {
            const dateStart = new Date(start);
            const diffInMinutes = (end.getTime() - dateStart.getTime()) / (1000 * 60);
            return diffInMinutes >= 5;
        }, {message: "End date must be at least 5 minutes after start date."}),
        additionalComments: z.string().optional(),
        trainerComments: z.string().optional(),
        trainingTickets: z.array(z.object({
            lesson: z.object({
                id: z.string(),
            }),
            mistakes: z.array(z.object({
                id: z.string(),
            })),
            scores: z.array(z.object({
                criteriaId: z.string(),
                cellId: z.string(),
                passed: z.boolean(),
            })),
            passed: z.boolean(),
        })).nonempty("You must add at least one training ticket."),
        enableMarkdown: z.boolean().optional(),
    });

    const result = trainingSessionZ.safeParse({
        id,
        student,
        start,
        end,
        trainingTickets,
        additionalComments,
        trainerComments,
        enableMarkdown,
    });

    if (!result.success) {
        return {errors: result.error.errors};
    }

    const firstLesson = trainingTickets[0].lesson;

    if (firstLesson.performanceIndicatorId && (!performanceIndicator || !performanceIndicator.categories.every((category) => category.criteria.every((criteria) => !!criteria.marker)))) {
        return {
            errors: [{
                message: "You must fill out ALL the performance indicators to submit this ticket."
            }]
        };
    }

    const session = await getServerSession(authOptions);

    let res: {
        session?: TrainingSession & any;
        release?: TrainerReleaseRequest;
        rosterUpdates?: LessonRosterChangeWithType[];
    } = {};

    if (id && session) {

        const oldTickets = await removeOldTrainingTickets(id);

        const trainingSession = await prisma.trainingSession.update({
            where: {id},
            data: {
                start,
                end,
                additionalComments: result.data.additionalComments,
                trainerComments: result.data.trainerComments,
                tickets: {
                    create: result.data.trainingTickets.map((t) => ({
                        lesson: {connect: {id: t.lesson.id}},
                        mistakes: {connect: t.mistakes.map((m) => ({id: m.id}))},
                        scores: {
                            create: t.scores.map((s) => (
                                {
                                    criteria: {connect: {id: s.criteriaId}},
                                    cell: {
                                        connect: {id: s.cellId}
                                    },
                                    passed: s.passed
                                }
                            ))
                        },
                        passed: t.passed,
                    })),
                },
                enableMarkdown: result.data.enableMarkdown,
            },
            include: {
                student: true,
                instructor: true,
                tickets: {
                    include: {
                        lesson: true,
                    },
                },
            },
        });

        await upsertVatusaTrainingSession(session.user.cid, trainingSession.student.cid, trainingSession);

        const passedLessons = trainingSession.tickets.filter((t) => t.passed);
        const oldPassedLessons = oldTickets.filter((t) => t.passed).map((t) => t.lesson);

        const rosterUpdates = await fetchAndUpdateRosterChanges(trainingSession.student as User, oldPassedLessons, passedLessons.map((t) => t.lesson));

        const release = await fetchAndUpdateReleaseRequest(trainingSession.student as User, passedLessons.map((t) => t.lesson));

        await sendInstructorEmails(trainingSession.student as User, trainingSession, oldTickets, trainingSession.tickets);

        revalidatePath('/training/sessions', "layout");

        await log("UPDATE", "TRAINING_SESSION", `Updated training session with student ${trainingSession.student.cid} - ${trainingSession.student.firstName} ${trainingSession.student.lastName}`);

        res = {session: trainingSession, release: release || undefined, rosterUpdates};

    } else if (session) {

        const trainingSession = await prisma.trainingSession.create({
            data: {
                student: {connect: {id: result.data.student}},
                instructor: {connect: {id: session.user.id}},
                start,
                end,
                additionalComments: result.data.additionalComments,
                trainerComments: result.data.trainerComments,
                tickets: {
                    create: result.data.trainingTickets.map((t) => ({
                        lesson: {connect: {id: t.lesson.id}},
                        mistakes: {connect: t.mistakes.map((m) => ({id: m.id}))},
                        scores: {
                            create: t.scores.map((s) => (
                                {
                                    criteria: {connect: {id: s.criteriaId}},
                                    cell: {
                                        connect: {id: s.cellId}
                                    },
                                    passed: s.passed
                                }
                            ))
                        },
                        passed: t.passed,
                    })),
                },
                enableMarkdown: result.data.enableMarkdown,
            },
            include: {
                student: true,
                instructor: true,
                tickets: {
                    include: {
                        lesson: true,
                    },
                },
            },
        });

        const vatusaId = await upsertVatusaTrainingSession(session.user.cid, trainingSession.student.cid, trainingSession);

        const passedLessons = trainingSession.tickets.filter((t) => t.passed);

        const rosterUpdates = await fetchAndUpdateRosterChanges(trainingSession.student as User, [], passedLessons.map((t) => t.lesson));

        const release = await fetchAndUpdateReleaseRequest(trainingSession.student as User, passedLessons.map((t) => t.lesson));

        await sendInstructorEmails(trainingSession.student as User, trainingSession, [], trainingSession.tickets);

        await prisma.trainingSession.update({
            where: {id: trainingSession.id},
            data: {
                vatusaId,
            }
        });

        after(async () => {
            await sendTrainingSessionCreatedEmail(trainingSession.student as User, trainingSession);
        });

        revalidatePath('/training/sessions', "layout");

        await log("CREATE", "TRAINING_SESSION", `Created training session with student ${trainingSession.student.cid} - ${trainingSession.student.firstName} ${trainingSession.student.lastName}`);

        res = {session: trainingSession, release: release || undefined, rosterUpdates};
    } else {
        return {
            errors: [{
                message: "You must be logged in to perform this action."
            }]
        };
    }

    if (performanceIndicator && res.session) {
        await prisma.trainingSessionPerformanceIndicator.deleteMany({
            where: {
                sessionId: res.session.id,
            }
        });

        await prisma.trainingSessionPerformanceIndicator.create({
            data: {
                sessionId: res.session.id,
                categories: {
                    create: performanceIndicator?.categories.map((category) => ({
                        name: category.name,
                        order: category.order,
                        criteria: {
                            create: category.criteria.map((score) => ({
                                name: score.name,
                                order: score.order,
                                marker: score.marker,
                                comments: score.comments,
                            })),
                        },
                    })),
                }
            }
        });
    }

    return res;
}

export const fetchTrainingSessions = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem, onlyUser?: User) => {
    const orderBy: Prisma.TrainingSessionOrderByWithRelationInput = {};
    if (sort.length > 0) {
        orderBy[sort[0].field === 'start' ? 'start' : 'end'] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.trainingSession.count({
            where: getWhere(filter, onlyUser),
        }),
        prisma.trainingSession.findMany({
            orderBy,
            where: getWhere(filter, onlyUser),
            include: {
                student: true,
                instructor: true,
                tickets: {
                    include: {
                        lesson: true,
                        mistakes: true,
                    },
                },
            },
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
        })
    ]);
}

const getWhere = (filter?: GridFilterItem, onlyUser?: User): Prisma.TrainingSessionWhereInput => {
    if (!filter) {
        return onlyUserWhere(onlyUser);
    }
    switch (filter?.field) {
        case 'student':
            return {
                student: {
                    OR: [
                        {
                            cid: {
                                [filter.operator]: filter.value as string,
                                mode: 'insensitive',
                            }
                        },
                        {
                            fullName: {
                                [filter.operator]: filter.value as string,
                                mode: 'insensitive',
                            }
                        },
                    ],
                },
            };
        case 'instructor':
            return {
                instructor: {
                    OR: [
                        {
                            cid: {
                                [filter.operator]: filter.value as string,
                                mode: 'insensitive',
                            }
                        },
                        {
                            fullName: {
                                [filter.operator]: filter.value as string,
                                mode: 'insensitive',
                            }
                        },
                    ],
                },
            };
        case 'lessons':
            return {
                tickets: {
                    some: {
                        lesson: {
                            OR: [
                                {
                                    identifier: {
                                        [filter.operator]: filter.value,
                                        mode: 'insensitive',
                                    },
                                },
                                {
                                    name: {
                                        [filter.operator]: filter.value,
                                        mode: 'insensitive',
                                    },
                                },
                            ],
                        },
                    },
                },
            };
        default:
            return onlyUserWhere(onlyUser);
    }
}

const onlyUserWhere = (onlyUser?: User): Prisma.TrainingSessionWhereInput => {
    if (onlyUser) {
        return {
            student: {
                id: onlyUser.id,
            }
        }
    }
    return {};
}

const getOtsStatus = (trainingTickets: { passed: boolean, lesson: Lesson, }[]): number => {
    let status = 0;

    for (const ticket of trainingTickets) {
        if (ticket.lesson.instructorOnly) {
            if (ticket.passed) {
                return 1; // OTS Pass
            } else {
                return 2; // OTS Fail
            }
        }
    }

    for (const ticket of trainingTickets) {
        if (ticket.lesson.notifyInstructorOnPass && status === 0) {
            status = 3; // OTS Recommended
        }
    }

    return status; // Not OTS
}

const removeOldTrainingTickets = async (sessionId: string) => {
    const oldTickets = await prisma.trainingTicket.findMany({
        where: {
            sessionId,
        },
        include: {
            lesson: true,
        },
    });

    if (oldTickets.length > 0) {
        await prisma.trainingTicket.deleteMany({
            where: {
                id: {
                    in: oldTickets.map((t) => t.id),
                },
            },
        });
    }

    return oldTickets;
}

const upsertVatusaTrainingSession = async (instructorCid: string, cid: string, trainingSession: TrainingSession & {
    tickets: {
        lesson: Lesson;
        passed: boolean;
    }[];
}) => {
    let ticketComment = "";

    trainingSession.tickets.map((t) => {
        ticketComment = ticketComment.concat(`${t.lesson.identifier}: ${t.passed ? 'PASS' : 'FAIL'}\n`)
    })

    ticketComment = ticketComment.concat('\nCOMMENTS: \n\n', `${trainingSession.additionalComments || 'No additional comments from trainer'}`)

    let status;
    if (trainingSession.vatusaId) {
        status = await editVatusaTrainingSession(cid, trainingSession.start, trainingSession.tickets.map((tt) => tt.lesson.position).join(','), getDuration(trainingSession.start, trainingSession.end), `${ticketComment}\n\nRefer to your training ticket in the vZDC website to see the scoring rubric.`, getOtsStatus(trainingSession.tickets), trainingSession.vatusaId);
    } else {
        status = await createVatusaTrainingSession(trainingSession.tickets[0].lesson.location, cid, instructorCid, trainingSession.start, trainingSession.tickets[0].lesson.position, getDuration(trainingSession.start, trainingSession.end), `${ticketComment}\n\nRefer to your training ticket in the vZDC website to see the scoring rubric.`, getOtsStatus(trainingSession.tickets));
    }

    if (status !== 'OK' && trainingSession.vatusaId) {
        await log("UPDATE", "TRAINING_SESSION", `A VATUSA error occurred when trying to POST training session.`)
        return;
    }

    return status;
}

const fetchAndUpdateRosterChanges = async (student: User, oldPassedLessons: Lesson[], passedLessons: Lesson[]) => {
    let rosterUpdates: LessonRosterChangeWithType[] = [];

    await Promise.all(passedLessons.map(async (l) => {
        const lessonRosterUpdates = await prisma.lessonRosterChange.findMany({
            where: {
                lessonId: l.id,
            },
            include: {
                certificationType: true,
            },
        });

        lessonRosterUpdates.forEach((lessonRosterUpdate) => {
            rosterUpdates.push(lessonRosterUpdate);
        });
    }));

    rosterUpdates = rosterUpdates.filter((update) => {
        return !oldPassedLessons.some((oldLesson) => oldLesson.id === update.lessonId);
    });

    await Promise.all(rosterUpdates.map(async (update) => {
        await prisma.certification.upsert({
            where: {
                certificationTypeId_userId: {
                    userId: student.id,
                    certificationTypeId: update.certificationType.id,
                },
            },
            create: {
                userId: student.id,
                certificationTypeId: update.certificationType.id,
                certificationOption: update.certificationOption,
            },
            update: {
                certificationOption: update.certificationOption,
            }
        });

        await writeDossier(update.dossierText, student.cid);
    }));

    return rosterUpdates;
}

const fetchAndUpdateReleaseRequest = async (student: User, passedLessons: Lesson[]) => {
    let release = null;

    if (passedLessons.some((l => l.releaseRequestOnPass))) {
        const assignment = await prisma.trainingAssignment.findUnique({
            where: {
                studentId: student.id,
            },
        });
        const releaseRequest = await prisma.trainerReleaseRequest.findFirst({
            where: {
                studentId: student.id,
            },
        });

        if (assignment && !releaseRequest) {
            release = await prisma.trainerReleaseRequest.create({
                data: {
                    studentId: student.id,
                    submittedAt: new Date(),
                }
            });
        }
    }

    return release;
}

const sendInstructorEmails = async (student: User, trainingSession: TrainingSession, oldTickets: TrainingTicketWithLesson[], newTickets: TrainingTicketWithLesson[]) => {
    for (const newTicket of newTickets) {

        if (!newTicket.lesson.notifyInstructorOnPass) {
            continue;
        }

        const oldTicket = oldTickets.find((ticket) => ticket.lesson.id === newTicket.lesson.id);

        if (!oldTicket || (!oldTicket.passed && newTicket.passed && newTicket.lesson.notifyInstructorOnPass)) {
            sendInstructorsTrainingSessionCreatedEmail(student, trainingSession, newTicket.lesson).then();
        }
    }
}