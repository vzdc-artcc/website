import React from 'react';
import {User} from "next-auth";
import prisma from "@/lib/db";
import {Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography} from "@mui/material";
import BroadcastDialog from "@/components/BroadcastViewer/BroadcastDialog";
import Link from "next/link";
import {ExpandMore, FileOpen} from "@mui/icons-material";
import Markdown from "react-markdown";

export default async function BroadcastViewer({user, includeSeen}: { user: User, includeSeen?: boolean }) {

    const unseenBroadcasts = await prisma.changeBroadcast.findMany({
        where: {
            OR: [
                {
                    unseenBy: {
                        some: {
                            id: user.id,
                        },
                    },
                },
                {
                    ...(includeSeen && {
                        seenBy: {
                            some: {
                                id: user.id,
                            },
                        },
                    }),
                },
            ],
        },
        orderBy: {
            timestamp: 'asc',
        },
        include: {
            file: true,
        }
    });

    return unseenBroadcasts.length > 0 && (
        <BroadcastDialog broadcasts={unseenBroadcasts} user={user}>
            {unseenBroadcasts.length === 1 && (
                <>
                    <Markdown>
                        {unseenBroadcasts[0].description}
                    </Markdown>
                    {unseenBroadcasts[0].file && (
                        <Box sx={{mt: 2,}}>
                            <Link href={`/publications/${unseenBroadcasts[0].file.id}`} target="_blank"
                                  style={{color: 'inherit',}}>
                                <Stack direction="row" spacing={1} sx={{
                                    alignItems: "center"
                                }}>
                                    <FileOpen/>
                                    <Typography variant="subtitle2">
                                        {unseenBroadcasts[0].file.name}
                                    </Typography>
                                </Stack>
                            </Link>
                        </Box>
                    )}
                </>
            )}
            {unseenBroadcasts.length > 1 && unseenBroadcasts.map(broadcast => (
                <Accordion key={broadcast.id}>
                    <AccordionSummary expandIcon={<ExpandMore/>}>
                        <Typography>{broadcast.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Markdown>
                            {broadcast.description}
                        </Markdown>
                        {broadcast.file && (
                            <Box sx={{mt: 2,}}>
                                <Link href={`/publications/${broadcast.file.id}`} target="_blank"
                                      style={{color: 'inherit',}}>
                                    <Stack direction="row" spacing={1} sx={{
                                        alignItems: "center"
                                    }}>
                                        <FileOpen/>
                                        <Typography variant="subtitle2">
                                            {broadcast.file.name}
                                        </Typography>
                                    </Stack>
                                </Link>
                            </Box>
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}
        </BroadcastDialog>
    );
}