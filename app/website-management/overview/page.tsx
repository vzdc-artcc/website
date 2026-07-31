'use client';
import React from 'react';
import {
    Alert,
    Avatar,
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Grid,
    Stack,
    Typography
} from "@mui/material";
import {ErrorOutline, Outbox, People, Sync, Task} from "@mui/icons-material";
import Link from "next/link";
import {useJobs} from "@/lib/osmium/hooks/jobs";
import {useRosterControllers} from "@/lib/osmium/hooks/users";
import {useAdminVisitorApplications} from "@/lib/osmium/hooks/visitor";
import {useEmailOutbox} from "@/lib/osmium/hooks/emails";
import RecentAuditActivity from "@/components/Logs/RecentAuditActivity";
import {jobLabel} from "@/lib/jobs";

type TileColor = 'default' | 'success' | 'warning' | 'error';

function StatTile({label, value, sub, href, icon, color = 'default'}: {
    label: string;
    value: React.ReactNode;
    sub?: string;
    href: string;
    icon: React.ReactNode;
    color?: TileColor;
}) {
    const valueColor = color === 'error' ? 'error.main' : color === 'warning' ? 'warning.main' : color === 'success' ? 'success.main' : 'text.primary';
    return (
        <Grid size={{xs: 6, md: 3}}>
            <Card sx={{height: '100%'}}>
                <CardActionArea component={Link} href={href} sx={{height: '100%'}}>
                    <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="overline" color="text.secondary">{label}</Typography>
                                <Typography variant="h4" fontWeight={700} color={valueColor} lineHeight={1.1}>{value}</Typography>
                                {sub && <Typography variant="caption" color={color === 'default' ? 'text.secondary' : valueColor}>{sub}</Typography>}
                            </Box>
                            <Avatar variant="rounded" sx={{bgcolor: 'action.hover', color: 'text.secondary'}}>{icon}</Avatar>
                        </Stack>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Grid>
    );
}

export default function Page() {
    const {data: jobs} = useJobs();
    const {data: roster} = useRosterControllers();
    const {data: visitors} = useAdminVisitorApplications({status: 'PENDING', pageSize: 1});
    const {data: outbox} = useEmailOutbox({pageSize: 1});

    const jobList = jobs ?? [];
    const failingJobs = jobList.filter((j) => j.last_result_ok === false);
    const healthy = jobList.length - failingJobs.length;

    const rosterTotal = roster?.total ?? roster?.items?.length ?? 0;
    const pendingVisitors = visitors?.total ?? 0;
    const outboxTotal = outbox?.total ?? 0;

    return (
        <Stack direction="column" spacing={3}>
            <Box>
                <Typography variant="h5" fontWeight={700}>Overview</Typography>
                <Typography color="text.secondary">Server administration at a glance.</Typography>
            </Box>

            <Grid container columns={12} spacing={2}>
                <StatTile label="Controllers" value={rosterTotal} href="/controllers/roster" icon={<People/>}/>
                <StatTile
                    label="Background Jobs"
                    value={`${healthy}/${jobList.length}`}
                    sub={failingJobs.length > 0 ? `${failingJobs.length} failing` : 'all healthy'}
                    color={failingJobs.length > 0 ? 'error' : 'success'}
                    href="/website-management/jobs"
                    icon={<Sync/>}
                />
                <StatTile
                    label="Pending Visitors"
                    value={pendingVisitors}
                    sub={pendingVisitors > 0 ? 'awaiting review' : 'none pending'}
                    color={pendingVisitors > 0 ? 'warning' : 'default'}
                    href="/admin/visitor-applications"
                    icon={<Task/>}
                />
                <StatTile
                    label="Emails in Outbox"
                    value={outboxTotal}
                    href="/website-management/emails/outbox"
                    icon={<Outbox/>}
                />
            </Grid>

            {failingJobs.length > 0 && (
                <Alert severity="error" icon={<ErrorOutline/>}>
                    <Typography variant="subtitle2" gutterBottom>Jobs needing attention</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {failingJobs.map((j) => (
                            <Chip key={j.job_name} size="small" color="error" component={Link}
                                  clickable href={`/website-management/jobs/${j.job_name}`}
                                  label={jobLabel(j.job_name)}/>
                        ))}
                    </Stack>
                </Alert>
            )}

            <RecentAuditActivity domain="all" limit={6} href="/website-management/audit"/>
        </Stack>
    );
}
