import React from 'react';
import prisma from "@/lib/db";
import {Box, Card, CardContent, Grid2, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import Link from "next/link";
import {StackedLineChart} from "@mui/icons-material";
import {getRating} from "@/lib/vatsim";
import StatisticsTable from "@/components/Statistics/StatisticsTable";
import {getControllerLog, getMonthLog, getTop3Controllers} from "@/lib/hours";

export default async function Page(props: { params: Promise<{ year: string }> }) {
    const params = await props.params;

    const {year} = params;

    if (!Number(year) || Number(year) < 2000 || Number(year) > new Date().getFullYear()) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h4">Invalid Year</Typography>
                    <Typography sx={{mt: 1,}}>Year must be after 2000 and not after this year</Typography>
                </CardContent>
            </Card>
        );
    }

    const logs = await prisma.controllerLogMonth.findMany({
        where: {
            year: parseInt(year),
        },
        include: {
            log: {
                include: {
                    user: true
                }
            }
        }
    });

    const totalHours = logs.reduce((acc, log) => {

        acc.deliveryHours += log.deliveryHours;
        acc.groundHours += log.groundHours;
        acc.towerHours += log.towerHours;
        acc.approachHours += log.approachHours;
        acc.centerHours += log.centerHours;

        return acc;
    }, {
        deliveryHours: 0,
        groundHours: 0,
        towerHours: 0,
        approachHours: 0,
        centerHours: 0

    });

    const monthLog = getMonthLog(logs);

    const top3Controllers = getTop3Controllers(logs);

    const controllerLog = getControllerLog(logs);

    return (
        (<Grid2 container columns={30} spacing={2}>
            <Grid2 size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h4">{year} Statistics</Typography>
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
            {top3Controllers.map((controller, idx) => (
                <Grid2
                    key={controller.user.cid}
                    size={{
                        xs: 30,
                        md: 10
                    }}>
                    <Card>
                        <CardContent>
                            <Box sx={{mb: 2,}}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography
                                        variant="h5">{idx + 1} - {controller.user.preferredName || `${controller.user.firstName} ${controller.user.lastName}`}</Typography>
                                    <Tooltip title="View Statistics for this controller">
                                        <Link href={`/controllers/statistics/${year}/-/${controller.user.cid}`}>
                                            <IconButton size="large">
                                                <StackedLineChart fontSize="large"/>
                                            </IconButton>
                                        </Link>
                                    </Tooltip>
                                </Stack>
                                <Typography
                                    variant="subtitle2">{controller.user.preferredName && `${controller.user.firstName} ${controller.user.lastName}`}</Typography>
                                <Typography
                                    variant="body1">{getRating(controller.user.rating)} • {controller.user.cid}</Typography>
                            </Box>
                            <Typography variant="h6">{controller.hours.toPrecision(3)} hours</Typography>
                        </CardContent>
                    </Card>
                </Grid2>
            ))}
            <Grid2 size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Monthly Totals</Typography>
                        <StatisticsTable heading="Month" logs={monthLog.filter((log) => !!log)}/>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Controller Totals</Typography>
                        <StatisticsTable heading="Controller" logs={controllerLog.filter((log) => !!log)}/>
                    </CardContent>
                </Card>
            </Grid2>
        </Grid2>)
    );
}