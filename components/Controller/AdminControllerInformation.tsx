import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import {Card, CardContent, Grid, Typography} from "@mui/material";
import ProfileCard from "@/components/Profile/ProfileCard";
import DossierForm from "@/components/Dossier/DossierForm";
import DossierTable from "@/components/Dossier/DossierTable";
import CertificationForm from "@/components/Certifications/CertificationForm";
import UserSettingsForm from "@/components/ControllerSettings/UserSettingsForm";
import TrainingSessionTable from '@/components/TrainingSession/TrainingSessionTable';

export default async function AdminControllerInformation({cid}: { cid: string, }) {
    const controller = await prisma.user.findUnique({
        where: {
            cid,
        },
        include: {
            certifications: {
                include: {
                    certificationType: true,
                },
            },
            soloCertifications: {
                include: {
                    certificationType: true,
                },
            },
            dossier: {
                orderBy: {
                    timestamp: 'desc',
                },
                include: {
                    writer: true,
                },
            },
        },
    });

    if (!controller) {
        notFound();
    }

    const certificationTypes = await prisma.certificationType.findMany({
        orderBy: {
            order: 'asc',
        },
    });

    const session = await getServerSession(authOptions);

    let isInstructor = false;
    const mentorCID = session!.user.cid;

    if (session!.user.roles.includes("INSTRUCTOR") || session!.user.roles.includes("STAFF")){
        isInstructor = true;
    }

    return session?.user && (
        <Grid container columns={4} spacing={2}>
            <Grid
                size={{
                    xs: 4,
                    lg: 3
                }}>
                <ProfileCard user={controller as User} admin={session.user.roles.includes("STAFF")}/>
            </Grid>
            <Grid
                size={{
                    xs: 4,
                    lg: 1
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 2,}}>User Settings</Typography>
                        {!session.user.roles.includes("STAFF") &&
                            <Typography>You are not allowed to view user settings.</Typography>}
                        {session.user.roles.includes("STAFF") && <UserSettingsForm user={controller as User}/>}
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 4,
                    lg: 4
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 1,}}>Recent Training History</Typography>
                        <TrainingSessionTable admin isInstructor={isInstructor} mentorCID={mentorCID}
                                  onlyUser={controller as User}/>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 4,
                    lg: 2
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 1,}}>Add Dossier Entry</Typography>
                        <DossierForm cid={controller.cid}/>
                        <Typography variant="h6" sx={{my: 2,}}>Member Dossier</Typography>
                        <DossierTable dossier={controller.dossier}
                                      ableToViewConfidential={session.user.staffPositions.some((sp) => {
                                          return sp === 'ATM' || sp === 'DATM' || sp === 'TA';
                                      })}/>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 4,
                    lg: 2
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Certifications</Typography>
                        <CertificationForm cid={controller.cid} certificationTypes={certificationTypes}
                                           certifications={controller.certifications}
                                           soloCertifications={controller.soloCertifications}/>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}