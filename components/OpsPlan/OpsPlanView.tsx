'use client';
import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import {eventGetDuration, formatZuluDate} from "@/lib/date";
import {OpenInNew} from "@mui/icons-material";
import Link from "next/link";
import {classifyPosition} from "@/actions/classifyPosition";
import Markdown from "react-markdown";
import OpsPlanTmiTable from "@/components/OpsPlan/OpsPlanTmiTable";
import {useEvent, useEventOpsPlan, useEventPositions, useEventTmis} from "@/lib/osmium/hooks/events";

type CategoryKey = 'Local' | 'Terminal' | 'Enroute';
type PositionLike = {
    id: string;
    user_cid?: number | null;
    user_name?: string | null;
    final_position?: string | null;
    final_start_time?: string | null;
    final_end_time?: string | null;
    final_notes?: string | null;
    controlling_category?: string | null;
    is_instructor: boolean;
    is_solo: boolean;
    is_ots: boolean;
    is_tmu: boolean;
    is_cic: boolean;
    published: boolean;
};

function renderFlags(p: PositionLike): React.ReactNode {
    const chips: React.ReactNode[] = [];
    if (p.is_instructor) chips.push(<Chip key="instructor" label="Instructor" color="primary" size="small" sx={{mr: 0.5}}/>);
    if (p.is_ots) chips.push(<Chip key="ots" label="OTS" color="warning" size="small" sx={{mr: 0.5}}/>);
    if (p.is_solo) chips.push(<Chip key="solo" label="Solo" color="success" size="small" sx={{mr: 0.5}}/>);
    if (p.is_tmu) chips.push(<Chip key="tmu" label="TMU" color="info" size="small" sx={{mr: 0.5}}/>);
    if (p.is_cic) chips.push(<Chip key="cic" label="CIC" color="secondary" size="small" sx={{mr: 0.5}}/>);
    if (p.published) chips.push(<Chip key="published" label="Published" color="default" size="small" sx={{mr: 0.5}}/>);
    return <>{chips}</>;
}

function isAdminCategory(p: PositionLike): boolean {
    return String(p.controlling_category || '').toUpperCase() === 'ADMIN';
}

function getCategoryForPosition(p: PositionLike): CategoryKey {
    if (p.controlling_category) {
        const up = String(p.controlling_category).toUpperCase();
        if (up === 'ENROUTE' || up === 'CTR') return 'Enroute';
        if (up === 'TERMINAL' || up === 'APP') return 'Terminal';
        return 'Local';
    }
    const cat = classifyPosition(p.final_position || '');
    return cat;
}

function FinalPositionsTable({title, positions}: { title: string; positions: PositionLike[] }) {
    return (
        <Paper sx={{p: 2, bgcolor: 'background.paper', borderRadius: 1}}>
            <Typography variant="h6" sx={{mb: 1}}>{title}</Typography>
            {positions.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                    No final positions in this category.
                </Typography>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{mt: 1, maxHeight: '60vh'}}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Controller</TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Start (UTC)</TableCell>
                                <TableCell>End (UTC)</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell>Flags</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {positions.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.user_name}{p.user_cid ? ` (${p.user_cid})` : ''}</TableCell>
                                    <TableCell>{p.final_position}</TableCell>
                                    <TableCell>{p.final_start_time ? formatZuluDate(new Date(p.final_start_time)) : ''}</TableCell>
                                    <TableCell>{p.final_end_time ? formatZuluDate(new Date(p.final_end_time)) : ''}</TableCell>
                                    <TableCell sx={{maxWidth: 300}}>{p.final_notes}</TableCell>
                                    <TableCell><Box sx={{display: 'flex', gap: 0.5, flexWrap: 'wrap'}}>{renderFlags(p)}</Box></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
}

export default function OpsPlanView({eventId}: { eventId: string }) {
    const {data: event, isLoading} = useEvent(eventId);
    const {data: opsPlan} = useEventOpsPlan(eventId);
    const {data: positionsData} = useEventPositions(eventId, {pageSize: 200});
    const {data: tmisData} = useEventTmis(eventId);

    if (isLoading || !event || !opsPlan) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    const featured = (opsPlan.featured_fields ?? []).map((f) => f.toUpperCase());
    const configs = (opsPlan.featured_field_configs && typeof opsPlan.featured_field_configs === 'object')
        ? opsPlan.featured_field_configs as Record<string, unknown>
        : {};
    const preset = opsPlan.preset_positions ?? [];

    const grouped: Record<CategoryKey, string[]> = {Local: [], Terminal: [], Enroute: []};
    for (const pos of preset) {
        grouped[classifyPosition(pos)].push(pos);
    }

    const allPositions = (positionsData?.items ?? []) as PositionLike[];
    const finalPositions = allPositions.filter((p) => p.final_position || p.final_start_time || p.final_end_time || p.final_notes);
    const adminFinalPositions = finalPositions.filter(isAdminCategory);
    const nonAdminFinalPositions = finalPositions.filter((p) => !isAdminCategory(p));

    const finalGrouped: Record<CategoryKey, PositionLike[]> = {Local: [], Terminal: [], Enroute: []};
    for (const p of nonAdminFinalPositions) {
        finalGrouped[getCategoryForPosition(p)].push(p);
    }

    const tmis = tmisData?.items ?? [];

    return (
        <Grid container spacing={2} columns={12}>
            <Grid size={12}>
                <Box sx={{flexGrow: 1}}>
                    <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography variant="h4">{event.title} - OPS Plan</Typography>
                            <Typography>START &nbsp;{formatZuluDate(new Date(event.starts_at))} (IN {eventGetDuration(new Date(), new Date(event.starts_at), true).toFixed(2)} days)</Typography>
                            <Typography>END &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{formatZuluDate(new Date(event.ends_at))} (+{eventGetDuration(new Date(event.starts_at), new Date(event.ends_at)).toFixed(2)} hours)</Typography>
                            <Typography variant="subtitle2" color="text.secondary" sx={{mt: 0.5}}>
                                Event Planner: {opsPlan.ops_planner_name ? `${opsPlan.ops_planner_name} (${opsPlan.ops_planner_cid})` : 'Unassigned'}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Tooltip title={event.hidden ? 'You must show the event to view information.' : 'View Event Page'}>
                                {event.hidden ? (
                                    <IconButton disabled size="large"><OpenInNew/></IconButton>
                                ) : (
                                    <Link href={`/events/${event.id}`} passHref>
                                        <IconButton size="large"><OpenInNew/></IconButton>
                                    </Link>
                                )}
                            </Tooltip>
                        </Stack>
                    </Stack>
                    <Divider sx={{my: 2,}}/>
                </Box>
            </Grid>

            <Grid size={12}>
                <Grid container spacing={2}>
                    {featured.length === 0 ? (
                        <Grid size={12}>
                            <Box sx={{p: 2, bgcolor: 'background.paper', borderRadius: 1}}>
                                <Typography variant="body1">No featured fields for this event.</Typography>
                            </Box>
                        </Grid>
                    ) : (
                        featured.map((field) => {
                            const cfg = configs[field] ?? configs[field.toLowerCase()];
                            const display = cfg == null ? 'No configuration provided.' :
                                typeof cfg === 'string' ? cfg : JSON.stringify(cfg, null, 2);
                            return (
                                <Grid key={field} size={4}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="subtitle1" sx={{fontWeight: 600}}>{field}</Typography>
                                            <Typography variant="body2" sx={{mb: 1}}>{display}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })
                    )}
                </Grid>

                <Divider sx={{my: 2}}/>

                <Grid size={12}>
                    <Paper sx={{p: 2, bgcolor: 'background.paper', borderRadius: 1}}>
                        <Typography variant="h6">Planned Staffing</Typography>
                        {preset.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                No preset positions defined for this event.
                            </Typography>
                        ) : (
                            <Grid container spacing={2} sx={{mt: 1}}>
                                {(['Local', 'Terminal', 'Enroute'] as CategoryKey[]).map((cat) => (
                                    <Grid key={cat} size={4}>
                                        <Typography variant="subtitle2" sx={{mb: 1}}>{cat}</Typography>
                                        <Box component="ul" sx={{pl: 2, m: 0}}>
                                            {grouped[cat].map((p, i) => (
                                                <li key={`${cat}-${p}-${i}`}><Typography variant="body2">{p}</Typography></li>
                                            ))}
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Paper>
                </Grid>

                <Divider sx={{my: 2}}/>

                <Grid size={12}>
                    <FinalPositionsTable title="Admin Positions" positions={adminFinalPositions}/>
                </Grid>

                <Divider sx={{my: 2}}/>

                <Grid size={12}>
                    <Grid container spacing={2}>
                        <Grid size={12}><FinalPositionsTable title="Local" positions={finalGrouped.Local}/></Grid>
                        <Grid size={12}><FinalPositionsTable title="Terminal" positions={finalGrouped.Terminal}/></Grid>
                        <Grid size={12}><FinalPositionsTable title="Enroute" positions={finalGrouped.Enroute}/></Grid>
                    </Grid>
                </Grid>

                <Divider sx={{my: 2}}/>

                <Grid size={12}>
                    <OpsPlanTmiTable tmis={tmis}/>
                </Grid>

                {opsPlan.ops_free_text ? (
                    <>
                        <Divider sx={{my: 2}}/>
                        <Grid size={12}>
                            <Paper sx={{p: 2, bgcolor: 'background.paper', borderRadius: 1}}>
                                <Typography variant="h6" sx={{mb: 1}}>Other Notes</Typography>
                                <Paper variant="outlined" sx={{p: 2, bgcolor: 'background.default'}}>
                                    <Markdown>{opsPlan.ops_free_text}</Markdown>
                                </Paper>
                            </Paper>
                        </Grid>
                    </>
                ) : null}
            </Grid>
        </Grid>
    );
}
