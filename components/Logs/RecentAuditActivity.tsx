'use client';
import React from 'react';
import {Box, Card, CardContent, Chip, CircularProgress, Divider, Link as MuiLink, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {useAuditLogs} from "@/lib/osmium/hooks/audit";
import {getTimeAgo} from "@/lib/date";
import {auditActionColor} from "@/lib/audit";
import {AuditDomain, domainResourceTypes} from "@/lib/auditLog";

/**
 * Compact recent-activity card for section overview pages. Server-filtered by
 * `domain`, so `limit` rows are `limit` domain rows (not a global page trimmed
 * to near-nothing). Links to the section's full log page via `href`.
 */
export default function RecentAuditActivity({
    domain,
    title = 'Recent Activity',
    limit = 10,
    href,
}: {
    domain: AuditDomain,
    title?: string,
    limit?: number,
    href?: string,
}) {
    const {data, isLoading} = useAuditLogs({pageSize: limit, resourceTypes: domainResourceTypes(domain)});
    const items = data?.items ?? [];

    return (
        <Card>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 1}}>
                    <Typography variant="h6">{title}</Typography>
                    {href && <MuiLink component={Link} href={href} variant="body2">View all →</MuiLink>}
                </Stack>
                {isLoading && <Box sx={{display: 'flex', justifyContent: 'center', py: 3}}><CircularProgress size={24}/></Box>}
                {!isLoading && items.length === 0 && <Typography color="text.secondary" variant="body2">No recent activity.</Typography>}
                {items.map((item, i) => (
                    <React.Fragment key={item.id}>
                        {i > 0 && <Divider/>}
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{py: 1}}>
                            <Chip label={item.action} size="small" color={auditActionColor(item.action)}
                                  variant={auditActionColor(item.action) === 'default' ? 'outlined' : 'filled'}/>
                            <Box sx={{minWidth: 0, flex: 1}}>
                                <Typography variant="body2" noWrap>{item.message || item.resource_type}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {item.actor_display_name || item.actor_id || 'system'} · {getTimeAgo(new Date(item.created_at))}
                                </Typography>
                            </Box>
                        </Stack>
                    </React.Fragment>
                ))}
            </CardContent>
        </Card>
    );
}
