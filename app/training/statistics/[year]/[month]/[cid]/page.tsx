import React from 'react';
import prisma from "@/lib/db";
import {getMonth} from "@/lib/date";
import {Card, CardContent, Grid2, Typography} from "@mui/material";
import {getRating} from "@/lib/vatsim";
import StatisticsTable from "@/components/Statistics/StatisticsTable";
import {getMonthLog, getTotalHours} from "@/lib/hours";
import {notFound} from "next/navigation";
import ControllingSessionsTable from "@/components/Statistics/ControllingSessionsTable";

export default async function Page(props: { params: Promise<{ year: string, month: string, cid: string, }> }) {
    const params = await props.params;

    const {year, month, cid} = params;

    if (!Number(year) || Number(year) < 2000 || Number(year) > new Date().getFullYear() || Number(month) < 0 || Number(month) > 11) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h4">Invalid Timeframe</Typography>
                    <Typography sx={{mt: 1,}}>Year must be after 2000 and not after this year. Month must also be within
                        0-11 range.</Typography>
                </CardContent>
            </Card>
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            cid: cid,
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
            year: parseInt(year),
            month: !isNaN(parseInt(month)) ? parseInt(month) : undefined,
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
                gte: new Date(parseInt(year), isNaN(parseInt(month)) ? 0 : parseInt(month), 1),
                lt: new Date(parseInt(year), isNaN(parseInt(month)) ? 11 : parseInt(month) + 1, 1),
            },
        },
        orderBy: {
            start: 'desc',
        },
    });

    const totalHours = getTotalHours(logs);

    const monthLog = getMonthLog(logs);

    return (
        (<Grid2 container columns={30} spacing={2}>
            <Grid2 size={30}>
                <Card>
                    <CardContent>
                        <Typography
                            variant="h5">{user.preferredName || `${user.firstName} ${user.lastName}`}</Typography>
                        <Typography
                            variant="body2">{user.preferredName && `${user.firstName} ${user.lastName}`}</Typography>
                        <Typography>{getRating(user.rating)} • {user.cid}</Typography>
                        <Typography>{parseInt(month) >= 0 && `${getMonth(parseInt(month))}, `}{year} Statistics</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Delivery Hours</Typography>
                        <Typography variant="h6">{totalHours.deliveryHours.toPrecision(3)} hours</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Ground Hours</Typography>
                        <Typography variant="h6">{totalHours.groundHours.toPrecision(3)} hours</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Tower Hours</Typography>
                        <Typography variant="h6">{totalHours.towerHours.toPrecision(3)} hours</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>TRACON Hours</Typography>
                        <Typography variant="h6">{totalHours.approachHours.toPrecision(3)} hours</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Center Hours</Typography>
                        <Typography variant="h6">{totalHours.centerHours.toPrecision(3)} hours</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Total Hours</Typography>
                        <Typography
                            variant="h6">{(totalHours.deliveryHours + totalHours.groundHours + totalHours.towerHours + totalHours.approachHours + totalHours.centerHours).toPrecision(3)} hours</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Controlling Sessions</Typography>
                        <ControllingSessionsTable positions={positionsWorked}/>
                    </CardContent>
                </Card>
            </Grid2>
            {isNaN(parseInt(month)) && <Grid2 size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Monthly Totals</Typography>
                        <StatisticsTable heading="Month" logs={monthLog.filter((log) => !!log)}/>
                    </CardContent>
                </Card>
            </Grid2>}
        </Grid2>)
    );
}