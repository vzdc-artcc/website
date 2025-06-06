import prisma from "@/lib/db";
import {getVatusaData} from "@/auth/vatsimProvider";
import {User} from "next-auth";
import {refreshAccountData} from "@/actions/user";
import {updateSyncTime} from "@/actions/lib/sync";
import {getOperatingInitials} from "@/actions/lib/oi";
import {getRating} from "@/lib/vatsim";
import {sendProgressionAssignedEmail} from "@/actions/mail/progression";
import {assignNextProgressionOrRemove, getProgressionStatus} from "@/actions/progressionAssignment";

export const dynamic = 'force-dynamic';

const DEV_MODE = process.env['DEV_MODE'] === 'true';
export async function GET() {
    rosterUpdate().then();
    return Response.json({ok: true, message: 'Roster update started.'});
}

async function rosterUpdate() {

    const users = await prisma.user.findMany();

    let controllerCount = 0;
    console.log(`ROSTER SYNC: Starting with ${users.length} users.`);

    for (const user of users) {

        if (!user.excludedFromVatusaRosterUpdate) {
            const vatusaData = await getVatusaData(user as User, users as User[]);
            let newOperatingInitials = user.operatingInitials;
            let showWelcomeMessage = user.showWelcomeMessage;
            if (vatusaData.controllerStatus === "NONE") {
                newOperatingInitials = null;
                await prisma.trainingAssignmentRequest.deleteMany({
                    where: {
                        studentId: user.id,
                    },
                });
                await prisma.trainingAssignment.deleteMany({
                    where: {
                        studentId: user.id,
                    },
                });
                await prisma.lOA.deleteMany({
                    where: {
                        userId: user.id,
                    },
                });
            } else if (user.controllerStatus === "NONE") {
                showWelcomeMessage = true;
                newOperatingInitials = await getOperatingInitials(user.firstName || '', user.lastName || '', users.map(user => user.operatingInitials).filter(initial => initial !== null) as string[]);
            }

            if (DEV_MODE) {
                await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        controllerStatus: "HOME",
                        showWelcomeMessage: true,
                        operatingInitials: newOperatingInitials,
                        roles: {
                            set: ['CONTROLLER', 'MENTOR', 'INSTRUCTOR', 'STAFF', 'EVENT_STAFF'],
                        },
                        staffPositions: {
                            set: ['ATM'],
                        },
                    },
                });
                continue;
            }

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    controllerStatus: vatusaData.controllerStatus,
                    discordUid: vatusaData.discordUid,
                    showWelcomeMessage: showWelcomeMessage,
                    joinDate: vatusaData.joinDate,
                    operatingInitials: newOperatingInitials,
                    roles: {
                        set: vatusaData.roles,
                    },
                    staffPositions: {
                        set: vatusaData.staffPositions,
                    },
                },
            });

            if (user.rating > 1) {
                const autoAssignCerts = await prisma.certificationType.findMany({
                    where: {
                        autoAssignUnrestricted: true,
                    },
                });

                for (const certificationType of autoAssignCerts) {

                    const existingCertification = await prisma.certification.findFirst({
                        where: {
                            userId: user.id,
                            certificationTypeId: certificationType.id,
                        },
                    });

                    if (existingCertification?.certificationOption !== 'NONE') {
                        continue;
                    }

                    await prisma.certification.upsert({
                        where: {
                            certificationTypeId_userId: {
                                userId: user.id,
                                certificationTypeId: certificationType.id,
                            },
                        },
                        create: {
                            userId: user.id,
                            certificationTypeId: certificationType.id,
                            certificationOption: 'UNRESTRICTED',
                        },
                        update: {
                            certificationOption: 'UNRESTRICTED',
                        },
                    });
                }
            }
        }

        await updateProgressionAssignments(user as User);

        await updateProgressionCompletions(user as User);

        await refreshAccountData(user as User, true);

        controllerCount++;
        console.log(`ROSTER SYNC: ${controllerCount}/${users.length}`);
    }

    await updateSyncTime({roster: new Date()});

    return Response.json({ok: true,});
}

const updateProgressionAssignments = async (user: User) => {
    if (!user.flagAutoAssignSinglePass && user.controllerStatus === 'HOME' && getRating(user.rating) === 'OBS') {

        const newHomeObsProgression = await prisma.trainingProgression.findFirst({
            where: {
                autoAssignNewHomeObs: true,
            },
        });
        if (newHomeObsProgression) {
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    trainingProgressionId: newHomeObsProgression.id,
                    flagAutoAssignSinglePass: true,
                },
            });

            sendProgressionAssignedEmail(user as User, newHomeObsProgression).catch(console.error);

        }
    }
}

const updateProgressionCompletions = async (user: User) => {
    const progressionStatus = await getProgressionStatus(user.id);

    if (progressionStatus.length === 0) {
        return;
    }

    if (progressionStatus.every(step => step.passed)) {
        await assignNextProgressionOrRemove(user.id, progressionStatus[0].progression);
    }
}