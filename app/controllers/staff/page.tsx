import React from 'react';
import prisma from "@/lib/db";
import {
    Card,
    CardContent,
    Grid2,
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

    return (
        (<Grid2 container columns={12} spacing={2}>
            <Grid2 size={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">{VATUSA_FACILITY} Staff</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
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
            </Grid2>
            <Grid2
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
            </Grid2>
            <Grid2
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
                        <TableContainer sx={{maxHeight: 400}}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Rating</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {atas.map(ata => (
                                        <TableRow key={ata.id}>
                                            <TableCell>{ata.firstName} {ata.lastName}</TableCell>
                                            <TableCell>{getRating(ata.rating)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
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
                        <TableContainer sx={{maxHeight: 400}}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Rating</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {aecs.map(aec => (
                                        <TableRow key={aec.id}>
                                            <TableCell>{aec.firstName} {aec.lastName}</TableCell>
                                            <TableCell>{getRating(aec.rating)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
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
                        <TableContainer sx={{maxHeight: 400}}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Rating</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {afes.map(afe => (
                                        <TableRow key={afe.id}>
                                            <TableCell>{afe.firstName} {afe.lastName}</TableCell>
                                            <TableCell>{getRating(afe.rating)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
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
                        <TableContainer sx={{maxHeight: 400}}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Rating</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {awms.map(awm => (
                                        <TableRow key={awm.id}>
                                            <TableCell>{awm.firstName} {awm.lastName}</TableCell>
                                            <TableCell>{getRating(awm.rating)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 12,
                    md: 6
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Instructors</Typography>
                        <TableContainer sx={{maxHeight: 600}}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Rating</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {instructors.map(instructor => (
                                        <TableRow key={instructor.id}>
                                            <TableCell>{instructor.firstName} {instructor.lastName}</TableCell>
                                            <TableCell>{getRating(instructor.rating)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 12,
                    md: 6
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Mentors</Typography>
                        <TableContainer sx={{maxHeight: 600}}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Rating</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {mentors.map(mentor => (
                                        <TableRow key={mentor.id}>
                                            <TableCell>{mentor.firstName} {mentor.lastName}</TableCell>
                                            <TableCell>{getRating(mentor.rating)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid2>
        </Grid2>)
    );

}