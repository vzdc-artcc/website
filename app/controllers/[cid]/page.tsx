import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {Card, CardContent, Grid, Typography} from "@mui/material";
import ProfileCard from "@/components/Profile/ProfileCard";
import {User} from "next-auth";
import StatisticsTable from "@/components/Statistics/StatisticsTable";
import {getMonthLog} from "@/lib/hours";
import ControllingSessionsTable from "@/components/Statistics/ControllingSessionsTable";
import {getMonth} from "@/lib/date";

export default async function Page(props: { params: Promise<{ cid: string }> }) {

    const params = await props.params;

    const {cid} = params;

    const user = await prisma.user.findUnique({
        where: {
            cid,
            controllerStatus: {
                not: 'NONE',
            },
        },
    });

    if (!user) {
        notFound();
    }

    const logs = await prisma.controllerLogMonth.findMany({
        where: {
            year: new Date().getFullYear(),
            log: {
                user: {
                    cid,
                },
            },
        },
        include: {
            log: {
                include: {
                    user: true
                }
            }
        }
    });

    const positionsWorked = await prisma.controllerPosition.findMany({
        where: {
            log: {
                user: {
                    cid,
                },
            },
            start: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            },
        },
        orderBy: {
            start: 'desc',
        },
    });

    return (
        (<Grid container columns={2} spacing={2}>
            <Grid size={2}>
                <ProfileCard user={user as User} viewOnly/>
            </Grid>
            <Grid
                size={{
                    xs: 2,
                    lg: 1
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">{new Date().getFullYear()} Statistics</Typography>
                        <StatisticsTable heading="Month" logs={getMonthLog(logs)}/>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 2,
                    lg: 1
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">{getMonth(new Date().getMonth())} Controlling Sessions</Typography>
                        <ControllingSessionsTable positions={positionsWorked}/>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>)
    );
}