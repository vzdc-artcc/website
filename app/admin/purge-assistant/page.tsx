import React from 'react';
import {Card, CardContent, Stack, Typography} from "@mui/material";
import prisma from "@/lib/db";
import PurgeAssistantTable from "@/components/PurgeAssistant/PurgeAssistantTable";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import RosterPurgeSelectionForm from "@/components/PurgeAssistant/RosterPurgeSelectionForm";
import {permanentRedirect} from "next/navigation";
import ErrorCard from "@/components/Error/ErrorCard";

export default async function Page(
    props: {
        searchParams: Promise<{
            startMonth: string,
            endMonth: string,
            maxHours: string,
            maxTrainingHours: string,
            year: string,
            includeLoas: string,
        }>,
    }
) {
    const searchParams = await props.searchParams;

    const {startMonth, endMonth, maxHours, maxTrainingHours, year, includeLoas,} = searchParams;

    if (!startMonth || !endMonth || !maxHours || !year || !maxTrainingHours) {
        permanentRedirect(`/admin/purge-assistant?startMonth=0&endMonth=11&maxHours=3&maxTrainingHours=1&year=${new Date().getFullYear()}&includeLoas=false`);
    }
    if (parseInt(startMonth) < 0 || parseInt(endMonth) > 12 || parseInt(startMonth) > parseInt(endMonth)) {
        return <ErrorCard heading="Roster Purge Assistant" message="Invalid bounds."/>
    }

    const controllers = await prisma.user.findMany({
        where: {
            controllerStatus: {
                not: "NONE",
            },
            trainingAssignmentRequestStudent: null,
            ...(includeLoas === 'false' && {
                OR: [
                    {
                        loas: {
                            every: {
                                status: {
                                    not: "APPROVED",
                                },
                            },
                        },
                    },
                ],
            }),
        },
        include: {
            log: {
                include: {
                    months: true,
                },
            },
            trainingSessionsGiven: {
                where: {
                    start: {
                        gte: new Date(Number(year), Number(startMonth), 1),
                        lte: new Date(Number(year), Number(endMonth), 0),
                    },
                },
            },
        },
    });

    let condensedControllers = controllers.map((controller) => {
        const filteredMonths = controller.log?.months.filter(month => {
            const monthInBounds = month.month >= parseInt(startMonth) && month.month <= parseInt(endMonth);
            return monthInBounds && month.year === parseInt(year);
        });
        const totalHours = filteredMonths?.reduce((sum, month) => sum + month.deliveryHours + month.groundHours + month.towerHours + month.approachHours + month.centerHours, 0) || 0;

        // Filter the training sessions where the person has been a trainer
        const trainerSessions = controller.trainingSessionsGiven?.filter(session => session.instructorId === controller.id);

        // Sum up the durations of the training sessions
        const totalTrainingHours = trainerSessions?.reduce((sum, session) => {
            const startDate = new Date(session.start);
            const endDate = new Date(session.end);
            const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60); // Convert milliseconds to hours
            return sum + duration;
        }, 0).toPrecision(3) || 'N/A';
        
        let homeController = false;
        if (controller.controllerStatus === "HOME"){
            homeController = true;
        }

        return {
            controller: controller as User,
            totalHours,
            totalTrainingHours,
            homeController,
        };
    });

    condensedControllers = condensedControllers.filter(data => {
        return data.totalHours + (Number(data.totalTrainingHours) || 0) < parseInt(maxHours);
    });

    const session = await getServerSession(authOptions);

    return session?.user && (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5" fontWeight="bold" sx={{
                        p: 2,
                        border: 4,
                        borderColor: 'red',
                        borderRadius: '8px',
                    }}>Roster Purge Assistant</Typography>
                    <RosterPurgeSelectionForm startMonth={parseInt(startMonth)} endMonth={parseInt(endMonth)}
                                              maxHours={parseInt(maxHours)} year={parseInt(year)}
                                              maxTrainingHours={parseInt(maxTrainingHours)}
                                              includeLoas={!!includeLoas}/>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6">Found {condensedControllers.length} Combined Controller(s)</Typography>
                    <PurgeAssistantTable controllers={condensedControllers} user={session.user}/>
                </CardContent>
            </Card>
        </Stack>
    );
}