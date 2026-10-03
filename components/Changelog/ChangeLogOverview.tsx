import React from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    Stack,
    Typography
} from "@mui/material";
import {Add, Edit, ExpandMore} from "@mui/icons-material";
import Markdown from "react-markdown";
import prisma from "@/lib/db";
import {formatZuluDate} from "@/lib/date";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import Link from "next/link";
import ChangeLogDeleteButton from "@/components/Changelog/ChangeLogDeleteButton";


export default async function ChangeLogOverview() {

    const session = await getServerSession(authOptions);

    const version = await prisma.version.findMany({
        include : {
            changeDetails : true
        },
        orderBy: {
            versionNumber: 'asc',
        }
    });

    version.sort((a,b)=>{return a.versionNumber.localeCompare(b.versionNumber, undefined, { numeric: true, sensitivity: 'base' });})

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Stack direction="row" spacing={1} sx={{
                        justifyContent: "space-between"
                    }}>
                        <Typography variant="h5">Website Changelog</Typography>
                        {session!.user.roles.includes("STAFF") ?
                            <Link href="/changelog/new">
                                <Button variant="contained" startIcon={<Add/>}>New Change Log</Button>
                            </Link>
                            :
                            <></>
                        }
                    </Stack>
                    {version.length !== 0 ?
                        <>
                            <Typography variant="subtitle1">Latest Documented
                                Version: <b>{version[version.length - 1].versionNumber}</b></Typography>
                            <Typography variant="subtitle2">Last
                                Updated: {formatZuluDate(version[version.length - 1].createdAt)}</Typography>
                        </>
                        :
                        <></>
                    }
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 1,}}>Versions</Typography>
                    {version.map((version) => (
                        <Accordion key={version.id}>
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Stack direction="row" spacing={1} sx={{
                                    alignItems: "center"
                                }}>
                                    <Typography>{version.versionNumber}</Typography>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Card variant="outlined">
                                    <CardContent>
                                        {session!.user.roles.includes("STAFF") ? 
                                            <>
                                                <Link href={`/changelog/${version.id}`} passHref>
                                                    <IconButton size="small">
                                                        <Edit/>
                                                    </IconButton>
                                                </Link>

                                               <ChangeLogDeleteButton changeLog={version}/>

                                            </>
                                        :
                                            <></>
                                        }
                                        <Stack direction="column" spacing={2}>

                                            <Box>
                                                <Markdown>{version.changeDetails[0].detail}</Markdown>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </CardContent>
            </Card>
        </Stack>
    );
}