import React, {ReactNode} from 'react';
import prisma from "@/lib/db";
import {
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {getRating} from "@/lib/vatsim";
import {Metadata} from "next";
import MatrixName from "@/components/Misc/MatrixName";
import {User} from "next-auth";
import {getChips} from "@/lib/staffPositions";

export const metadata: Metadata = {
    title: 'Staff | vZDC',
    description: 'vZDC staff page, get to know vZDC Staff!',
};

const VATUSA_FACILITY = process.env.VATUSA_FACILITY;

export default async function Page() {

    const atm = await prisma.user.findFirst({
        where: {
            staffPositions: {
                has: 'ATM',
            },
        },
    });

    const datm = await prisma.user.findFirst({
        where: {
            staffPositions: {
                has: 'DATM',
            },
        },
    });

    const ta = await prisma.user.findFirst({
        where: {
            staffPositions: {
                has: 'TA',
            },
        },
    });

    const fe = await prisma.user.findFirst({
        where: {
            staffPositions: {
                has: 'FE',
            },
        },
    });

    const wm = await prisma.user.findFirst({
        where: {
            staffPositions: {
                has: 'WM',
            },
        },
    });

    const ec = await prisma.user.findFirst({
        where: {
            staffPositions: {
                has: 'EC',
            },
        },
    });

    const atas = await prisma.user.findMany({
        where: {
            staffPositions: {
                has: 'ATA',
            },
        },
        orderBy: {
            lastName: 'asc',
        },
    });

    const awms = await prisma.user.findMany({
        where: {
            staffPositions: {
                has: 'AWM',
            },
        },
        orderBy: {
            lastName: 'asc',
        },
    });

    const afes = await prisma.user.findMany({
        where: {
            staffPositions: {
                has: 'AFE',
            },
        },
        orderBy: {
            lastName: 'asc',
        },
    });

    const aecs = await prisma.user.findMany({
        where: {
            staffPositions: {
                has: 'AEC',
            },
        },
        orderBy: {
            lastName: 'asc',
        },
    });

    const instructors = await prisma.user.findMany({
        where: {
            roles: {
                has: 'INSTRUCTOR',
            },
        },
        orderBy: {
            lastName: 'asc',
        },
    });

    const mentors = await prisma.user.findMany({
        where: {
            roles: {
                has: 'MENTOR',
            },
        },
        orderBy: {
            lastName: 'asc',
        },
    });

    const fcs = await prisma.user.findMany({
        where: {
            staffPositions: {
                has: 'FC',
            },
        },
        orderBy: {
            lastName: 'asc',
        },
    });

    return (
        (<Grid container columns={12} spacing={2}>
            <Grid size={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">{VATUSA_FACILITY} Staff</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6
                }}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="subtitle2">Air Traffic Manager (ATM)</Typography>
                        <Typography variant="h3">{atm?.firstName} {atm?.lastName}</Typography>
                        <Typography>atm@vzdc.org</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6
                }}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="subtitle2">Deputy Air Traffic Manager (DATM)</Typography>
                        <Typography variant="h3">{datm?.firstName} {datm?.lastName}</Typography>
                        <Typography>datm@vzdc.org</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                    lg: 3
                }}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="subtitle2">Training Administrator (TA)</Typography>
                        <Typography variant="h4">{ta?.firstName} {ta?.lastName}</Typography>
                        <Typography>ta@vzdc.org</Typography>
                        <Typography variant="subtitle2" sx={{mt: 4,}}>Assistant Training Administrators
                            (ATAs)</Typography>
                        {getAssistantTable(atas as User[])}
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                    lg: 3
                }}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="subtitle2">Event Coordinator (EC)</Typography>
                        <Typography variant="h4">{ec?.firstName} {ec?.lastName}</Typography>
                        <Typography>ec@vzdc.org</Typography>
                        <Typography variant="subtitle2" sx={{mt: 4,}}>Assistant Event Coordinators (AECs)</Typography>
                        {getAssistantTable(aecs as User[])}
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                    lg: 3
                }}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="subtitle2">Facility Engineer (FE)</Typography>
                        <Typography variant="h4">{fe?.firstName} {fe?.lastName}</Typography>
                        <Typography>fe@vzdc.org</Typography>
                        <Typography variant="subtitle2" sx={{mt: 4,}}>Assistant Facility Engineers (AFEs)</Typography>
                        {getAssistantTable(afes as User[])}
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                    lg: 3
                }}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="subtitle2">Webmaster (WM)</Typography>
                        <MatrixName firstName={wm?.firstName ?? ''} lastName={wm?.lastName ?? ''}/>
                        <Typography>wm@vzdc.org</Typography>
                        <Typography variant="subtitle2" sx={{mt: 4,}}>Assistant Webmasters (AWMs)</Typography>
                        {getAssistantTable(awms as User[])}
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6
                }}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6">Instructors</Typography>
                        {getAssistantTable(instructors as User[])}
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 6
                }}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6">Mentors</Typography>
                        {getAssistantTable(mentors as User[])}
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                }}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6">Financial Committee</Typography>
                        {getAssistantTable(fcs as User[], "Staff Position(s)", getChips)}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>)
    );

}

const getAssistantTable = (users: User[], extraColumnName?: string, extraColumn?: (user: User) => ReactNode) => {
    return users.length > 0 ? (
        <TableContainer sx={{maxHeight: 600}}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Rating</TableCell>
                        {extraColumnName && <TableCell>{extraColumnName}</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map(user => (
                        <TableRow key={user.id}>
                            <TableCell>{user.firstName} {user.lastName}</TableCell>
                            <TableCell>{getRating(user.rating)}</TableCell>
                            {extraColumn && <TableCell>{extraColumn(user)}</TableCell>}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    ) : (<Typography variant="caption">N/A</Typography>);
}