import React from 'react';
import prisma from "@/lib/db";
import {User} from "next-auth";
import {Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {getRating} from "@/lib/vatsim";
import {getIconForCertificationOption} from "@/lib/certification";
import {getChips} from "@/lib/staffPositions";
import Link from "next/link";
import {LOA} from "@/generated/prisma/browser";

const VATUSA_FACILITY = process.env.VATUSA_FACILITY || 'ZDC';

export default async function RosterTable({membership, search, includeVatusa,}: {
    membership: 'home' | 'visit' | 'both',
    search?: string,
    includeVatusa?: boolean,
}) {

    let data: {
        cid: number,
        fname: string,
        lname: string,
        rating: number,
        facility: string,
        membership: 'home' | 'visit',
        roles: {
            facility: string,
            role: string,
        }[],
    }[] = [];

    if (includeVatusa) {
        const res = await fetch(`https://api.vatusa.net/v2/facility/${VATUSA_FACILITY}/roster/${membership}`, {
            next: {
                revalidate: 3600,
            }
        });
        data = (await res.json()).data;
    }

    const users = await prisma.user.findMany({
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
            loas: true,
        },
        where: {
            controllerStatus: membership === 'both' ? undefined : membership === 'home' ? 'HOME' : 'VISITOR',
            OR: [
                {
                    AND: [
                        {
                            OR: [
                                {
                                    hiddenFromRoster: null,
                                },
                                {
                                    hiddenFromRoster: {
                                        not: true,
                                    },
                                },
                            ],
                        },
                        {
                            OR: [
                                {
                                    fullName: {
                                        contains: search || '',
                                        mode: 'insensitive',
                                    },
                                },
                                {
                                    preferredName: {
                                        contains: search || '',
                                        mode: 'insensitive',
                                    },
                                },
                                {
                                    cid: {
                                        contains: search || '',
                                        mode: 'insensitive',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        orderBy: {
            fullName: 'asc',
        },
    });

    let controllers: {
        vatusa: {
            cid: number,
            fname: string,
            lname: string,
            rating: number,
            facility: string,
            membership: 'home' | 'visit',
            roles: {
                facility: string,
                role: string,
            }[],
        } | null,
        user?: User | any,
    }[];
    if (includeVatusa) {
        controllers = data.map((vatusaUser) => ({
            vatusa: vatusaUser,
            user: users.find((user) => user.cid === vatusaUser.cid + ''),
        }));
    } else {
        controllers = users.map((user) => ({
            vatusa: null,
            user,
        }));
    }
    controllers = controllers.sort((a, b) => {
        if (a.user && b.user) {
            return (a.user.lastName || '').localeCompare((b.user.lastName || ''));
        } else if (a.user) {
            return -1;
        } else if (b.user) {
            return 1;
        } else {
            return a.vatusa?.lname.localeCompare(b.vatusa?.lname || '');
        }
    }).filter((controller) => {
        // filter by the search query here
        if (search !== undefined && search.length > 0) {
            if (controller.user) {
                return (controller.user.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
                    controller.user.cid.toLowerCase().includes(search.toLowerCase()) ||
                    (controller.user.preferredName || '').toLowerCase().includes(search.toLowerCase());
            } else {
                return controller.vatusa?.fname.toLowerCase().includes(search.toLowerCase()) ||
                    controller.vatusa?.lname.toLowerCase().includes(search.toLowerCase()) ||
                    (controller.vatusa?.cid + '').toLowerCase().includes(search.toLowerCase());
            }
        }
        return true;
    });


    const certificationTypes = await prisma.certificationType.findMany({
        orderBy: {
            order: 'asc',
        },
    });

    return (
        <TableContainer sx={{maxHeight: '100vh',}}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Controller</TableCell>
                        <TableCell>Operating Initials</TableCell>
                        {certificationTypes.map((certificationType) => (
                            <TableCell key={certificationType.id}>{certificationType.name}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {controllers.length + users.length === 0 &&
                        <Typography>No results found for {search}</Typography>}
                    {controllers.map((user) => {
                        if (user.user) {

                            const approvedLoas = user.user.loas.filter((loa: LOA) => loa.status === "APPROVED");

                            return (
                                <TableRow key={user.user.cid}>
                                    <TableCell>
                                        <Link href={`/controllers/${user.user.cid}`}
                                              style={{color: 'inherit', textDecoration: 'none',}}>
                                            <Typography
                                                variant="h6">{user.user.preferredName || `${user.user.firstName} ${user.user.lastName}`}
                                                {approvedLoas.length > 0 &&
                                                    <Chip label="LOA" color="primary" size="small" sx={{ml: 1,}}/>}
                                            </Typography>
                                        </Link>
                                        <Typography
                                            variant="body2">{user.user.preferredName && `${user.user.firstName} ${user.user.lastName}`}</Typography>
                                        <Typography
                                            variant="body1">{getRating(user.user.rating)} • {user.user.cid}</Typography>
                                        {user.user.controllerStatus === "HOME" && getChips(user.user as User)}
                                        {user.user.controllerStatus === "VISITOR" &&
                                            <Typography>{user.user.artcc}</Typography>}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="h5">{user.user.operatingInitials}</Typography>
                                    </TableCell>
                                    {certificationTypes.map((certificationType) => (
                                        <TableCell key={certificationType.id}>
                                            {getIconForCertificationOption(user.user.certifications.find((certification: any) => certification.certificationType.id === certificationType.id)?.certificationOption || "NONE", user.user.soloCertifications.find((soloCertification: any) => soloCertification.certificationType.id === certificationType.id))}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )
                        } else if (user.vatusa) {
                            return (
                                <TableRow key={user.vatusa.cid}>
                                    <TableCell>
                                        <Typography
                                            variant="h6">{user.vatusa.fname} {user.vatusa.lname}</Typography>
                                        <Typography
                                            variant="body1">{getRating(user.vatusa.rating)} • {user.vatusa.cid}</Typography>
                                        <Typography
                                            variant="subtitle2">{user.vatusa.membership === 'home' ? 'Home Controller' : `Visiting Controller (${user.vatusa.facility})`}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="h5">-</Typography>
                                    </TableCell>
                                    {certificationTypes.map((certificationType) => (
                                        <TableCell key={certificationType.id}>
                                            {getIconForCertificationOption("NONE")}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )
                        }

                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}