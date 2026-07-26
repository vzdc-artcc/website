'use client';
import React from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography} from "@mui/material";
import BroadcastDialog from "@/components/BroadcastViewer/BroadcastDialog";
import Link from "next/link";
import {ExpandMore, FileOpen} from "@mui/icons-material";
import Markdown from "react-markdown";
import {useMyBroadcasts} from "@/lib/osmium/hooks/broadcasts";

export default function BroadcastViewer({includeSeen}: { includeSeen?: boolean }) {

    const {data} = useMyBroadcasts();
    const items = data?.items ?? [];

    const pendingBroadcasts = items.filter((b) => !b.agreed_at && (includeSeen || !b.seen_at));

    if (pendingBroadcasts.length === 0) {
        return null;
    }

    return (
        <BroadcastDialog broadcasts={pendingBroadcasts}>
            {pendingBroadcasts.length === 1 && (
                <>
                    <Markdown>
                        {pendingBroadcasts[0].description}
                    </Markdown>
                    {pendingBroadcasts[0].file_id && (
                        <Box sx={{mt: 2,}}>
                            <Link href={`/publications/${pendingBroadcasts[0].file_id}`} target="_blank"
                                  style={{color: 'inherit',}}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <FileOpen/>
                                    <Typography variant="subtitle2">
                                        {pendingBroadcasts[0].file_filename}
                                    </Typography>
                                </Stack>
                            </Link>
                        </Box>
                    )}
                </>
            )}
            {pendingBroadcasts.length > 1 && pendingBroadcasts.map(broadcast => (
                <Accordion key={broadcast.id}>
                    <AccordionSummary expandIcon={<ExpandMore/>}>
                        <Typography>{broadcast.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Markdown>
                            {broadcast.description}
                        </Markdown>
                        {broadcast.file_id && (
                            <Box sx={{mt: 2,}}>
                                <Link href={`/publications/${broadcast.file_id}`} target="_blank"
                                      style={{color: 'inherit',}}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <FileOpen/>
                                        <Typography variant="subtitle2">
                                            {broadcast.file_filename}
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
