'use client';
import React from 'react';
import {Card, CardContent, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import Link from "next/link";
import {StackedLineChart} from "@mui/icons-material";
import {useArtccStats} from "@/lib/osmium/hooks/stats";

export default function TopControllersCard() {
    const now = new Date();
    const {data} = useArtccStats({year: now.getFullYear(), month: now.getMonth() + 1, top: 3});
    const top3 = (data?.leaders ?? []).slice(0, 3);

    return (
        <Card sx={{height: 600, overflowY: 'auto',}}>
            <CardContent>
                <Typography variant="h5" sx={{mb: 1,}}>Top 3 Controllers</Typography>
                <Stack direction="column" spacing={1}>
                    {top3.map((controller, idx) => (
                        <Card elevation={0} key={controller.cid}>
                            <CardContent>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="h5">{idx + 1} - {controller.name}</Typography>
                                    <Tooltip title="View Statistics for this controller">
                                        <Link href={`/controllers/statistics/${now.getFullYear()}/-/${controller.cid}`}
                                              style={{color: 'inherit', textDecoration: 'none',}}>
                                            <IconButton size="large">
                                                <StackedLineChart fontSize="large"/>
                                            </IconButton>
                                        </Link>
                                    </Tooltip>
                                </Stack>
                                {/* online_hours = connected time, the same metric the leaderboard is ranked by,
                                    so the number matches the rank (matches the current site's behavior). */}
                                <Typography variant="subtitle2">{controller.online_hours.toPrecision(3)} hours</Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}
