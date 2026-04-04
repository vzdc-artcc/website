import React from 'react';
import {fetchFullEvent} from "@/actions/opsPlan";
import {
    Box,
    Card,
    CardContent,
    Chip,
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
import {notFound} from "next/navigation";
import {classifyPosition} from "@/actions/classifyPosition";
import Markdown from "react-markdown";
import OpsPlanTmiTable from "@/components/OpsPlan/OpsPlanTmiTable";

type Props = {
    eventId: string;
};

const RATING_ID_TO_SHORT: Record<number, string> = {
    [-1]: "INA",
    0: "SUS",
    1: "OBS",
    2: "S1",
    3: "S2",
    4: "S3",
    5: "C1",
    6: "C2",
    7: "C3",
    8: "I1",
    9: "I2",
    10: "I3",
    11: "SUP",
    12: "ADM",
};

function getShortRating(rating: unknown): string | null {
    if (rating === null || rating === undefined || rating === '') return null;

    const numeric = typeof rating === 'number' ? rating : Number(rating);
    if (!Number.isFinite(numeric)) return String(rating);

    return RATING_ID_TO_SHORT[numeric] ?? String(numeric);
}

function formatPlanner(planner: any): string {
    if (!planner) return 'Unassigned';

    const name = [planner.firstName, planner.lastName].filter(Boolean).join(' ').trim()
        || planner.fullName
        || `CID ${planner.cid ?? 'Unknown'}`;
    const rating = getShortRating(planner.rating);
    const cid = planner.cid ? ` (${planner.cid})` : '';

    return `${name}${rating ? ` - ${rating}` : ''}${cid}`;
}

function parseFeaturedConfigs(raw: any): Record<string, any> {
    if (!raw) return {};
    if (typeof raw === 'string') {
        try {
            return raw ? JSON.parse(raw) : {};
        } catch {
            return { __raw: raw };
        }
    }
    if (typeof raw === 'object') {
        return raw;
    }
    return {};
}

function getConfigForField(field: string, configs: Record<string, any>) {
    const keyUpper = String(field || '').toUpperCase();
    const keyLower = String(field || '').toLowerCase();

    if (configs == null) return undefined;
    if (Object.prototype.hasOwnProperty.call(configs, keyUpper)) return configs[keyUpper];
    if (Object.prototype.hasOwnProperty.call(configs, field)) return configs[field];
    if (Object.prototype.hasOwnProperty.call(configs, keyLower)) return configs[keyLower];
    if (Object.prototype.hasOwnProperty.call(configs, '__raw')) return configs.__raw;
    return undefined;
}

function renderFlags(p: any): React.ReactNode {
    const chips: React.ReactNode[] = [];

    if (p.isInstructor) chips.push(<Chip key="instructor" label="Instructor" color="primary" size="small" sx={{ mr: 0.5 }} />);
    if (p.isOts) chips.push(<Chip key="ots" label="OTS" color="warning" size="small" sx={{ mr: 0.5 }} />);
    if (p.isSolo) chips.push(<Chip key="solo" label="Solo" color="success" size="small" sx={{ mr: 0.5 }} />);
    if (p.isTmu) chips.push(<Chip key="tmu" label="TMU" color="info" size="small" sx={{ mr: 0.5 }} />);
    if (p.isCic) chips.push(<Chip key="cic" label="CIC" color="secondary" size="small" sx={{ mr: 0.5 }} />);
    if (p.published) chips.push(<Chip key="published" label="Published" color="default" size="small" sx={{ mr: 0.5 }} />);

    return <>{chips}</>;
}

type CategoryKey = 'Local' | 'Terminal' | 'Enroute';

function isAdminCategory(p: any): boolean {
    return String(p?.controllingCategory || '').toUpperCase() === 'ADMIN';
}

function getCategoryForPosition(p: any): CategoryKey {
    if (p && p.controllingCategory) {
        const up = String(p.controllingCategory).toUpperCase();
        if (up === 'ENROUTE' || up === 'CTR') return 'Enroute';
        if (up === 'TERMINAL' || up === 'APP') return 'Terminal';
        return 'Local';
    }

    const posLabel = (p && (p.finalPosition || p.requestedPosition)) ? String(p.finalPosition || p.requestedPosition) : '';
    try {
        const cat = classifyPosition(posLabel || '');
        if (cat === 'Local' || cat === 'Terminal' || cat === 'Enroute') return cat;
    } catch (e) {
    }
    return 'Terminal';
}

function FinalPositionsTable({ title, positions }: { title: string; positions: any[] }) {
    return (
        <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>

            {positions.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No final positions in this category.
                </Typography>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 1, maxHeight: '60vh' }}>
                    <Table stickyHeader size="small" aria-label={`${title.toLowerCase()} final positions table`}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ minWidth: 220 }}>Controller</TableCell>
                                <TableCell sx={{ minWidth: 160 }}>Position</TableCell>
                                <TableCell sx={{ minWidth: 160 }}>Start time (UTC)</TableCell>
                                <TableCell sx={{ minWidth: 160 }}>End time (UTC)</TableCell>
                                <TableCell>Final Notes</TableCell>
                                <TableCell sx={{ minWidth: 200 }}>Flags</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {positions.map((p: any) => {
                                const user = p.user || {};
                                const controllerName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '';
                                const altName = controllerName || (user.cid ? `CID ${user.cid}` : 'Unknown');
                                const rating = getShortRating(user.rating);
                                const posLabel = p.finalPosition || p.requestedPosition || 'Unknown';
                                const start = p.finalStartTime ? formatZuluDate(p.finalStartTime) : (p.requestedStartTime ? formatZuluDate(p.requestedStartTime) : '');
                                const end = p.finalEndTime ? formatZuluDate(p.finalEndTime) : (p.requestedEndTime ? formatZuluDate(p.requestedEndTime) : '');
                                const notes = p.finalNotes ?? '';

                                return (
                                    <TableRow
                                        key={
                                            p.id ??
                                            `${p.requestedPosition || 'unknown'}-${user.id ?? user.cid ?? 'nouser'}-${p.finalStartTime ?? p.requestedStartTime ?? ''}`
                                        }
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{altName}</Typography>
                                                    {rating ? <Typography variant="caption" color="text.secondary">Rating: {rating}</Typography> : null}
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{posLabel}</Typography>
                                            {p.controllingCategory ? <Typography variant="caption" color="text.secondary">{String(p.controllingCategory).toUpperCase()}</Typography> : null}
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">{start}</Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">{end}</Typography>
                                        </TableCell>

                                        <TableCell sx={{ maxWidth: 420 }}>
                                            <Tooltip title={notes || 'No notes'}>
                                                <Typography variant="body2" sx={{
                                                    whiteSpace: 'pre-wrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                }}>
                                                    {notes || "No Notes"}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>

                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {renderFlags(p)}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
}

export default async function OpsPlanView({ eventId }: Props) {
    const event: any = await fetchFullEvent(eventId);
    if (!event) return notFound();

    const configs = parseFeaturedConfigs(event.featuredFieldConfigs);
    const featured = Array.isArray(event.featuredFields) ? event.featuredFields.map((f: string) => f.toUpperCase()) : [];

    const preset = Array.isArray(event.presetPositions) ? event.presetPositions : [];

    const grouped: Record<'Local'|'Terminal'|'Enroute', string[]> = {
        Local: [],
        Terminal: [],
        Enroute: [],
    };

    for (const pos of preset) {
        const cat = classifyPosition(pos);
        grouped[cat].push(pos);
    }

    const finalPositions = Array.isArray((event as any).positions)
        ? (event as any).positions.filter((p: any) =>
            (p.finalPosition !== undefined && p.finalPosition !== null)
            || p.finalPosition === ''
            || p.finalStartTime
            || p.finalEndTime
            || p.finalNotes
        )
        : [];

    const adminFinalPositions = finalPositions.filter((p: any) => isAdminCategory(p));
    const nonAdminFinalPositions = finalPositions.filter((p: any) => !isAdminCategory(p));

    const finalGrouped: Record<CategoryKey, any[]> = {
        Local: [],
        Terminal: [],
        Enroute: [],
    };

    for (const p of nonAdminFinalPositions) {
        const cat = getCategoryForPosition(p);
        finalGrouped[cat].push(p);
    }

    const eventTmis = Array.isArray((event as any).eventTmis)
        ? (event as any).eventTmis
        : [];

    const legacyTmis = String((event as any).tmis || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text, idx) => ({
            id: `legacy-${idx}`,
            category: 'LOCAL',
            text,
            createdAt: null,
        }));

    const tmisForDisplay = eventTmis.length > 0 ? eventTmis : legacyTmis;
    const planner = (event as any).opsPlanner;


    return (
        <Grid container spacing={2} columns={12}>
            <Grid size={12}>
                <Box sx={{ flexGrow: 1 }}>
                    <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography variant="h4">{event.name} - OPS Plan</Typography>
                            <Typography>START &nbsp;{formatZuluDate(event.start)} (IN {eventGetDuration(new Date(), event.start, true).toFixed(2)} days)</Typography>
                            <Typography>END &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{formatZuluDate(event.end)} (+{eventGetDuration(event.start, event.end).toFixed(2)} hours)</Typography>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Event Planner: {formatPlanner(planner)}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Tooltip title={event.hidden ? 'You must show the event to view information.' : 'View Event Page'}>
                                {event.hidden ? (
                                    <IconButton disabled size="large">
                                        <OpenInNew />
                                    </IconButton>
                                ) : (
                                    <Link href={`/events/${event.id}`} passHref>
                                        <IconButton size="large">
                                            <OpenInNew />
                                        </IconButton>
                                    </Link>
                                )}
                            </Tooltip>
                        </Stack>
                    </Stack>
                    <Divider sx={{ my: 2, }} />
                </Box>
            </Grid>

            <Grid size={12}>
                <Grid container spacing={2}>
                    {featured.length === 0 ? (
                        <Grid size={12}>
                            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                <Typography variant="body1">No featured fields for this event.</Typography>
                            </Box>
                        </Grid>
                    ) : (
                        featured.map((field: string) => {
                            const cfg = getConfigForField(field, configs);
                            const display = cfg == null ? 'No configuration provided.' :
                                typeof cfg === 'string' ? cfg : JSON.stringify(cfg, null, 2);

                            return (
                                <Grid key={field} size={4}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{field}</Typography>
                                            <Typography variant="body2" sx={{ mb: 1 }}>{display}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )
                        })
                    )}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Grid size={12}>
                    <Box>
                        <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <Typography variant="h6">Planned Staffing</Typography>

                            {preset.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    No preset positions defined for this event.
                                </Typography>
                            ) : (
                                <Grid container spacing={2} sx={{mt: 1}}>
                                    <Grid size={4}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Local</Typography>
                                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                            {grouped.Local.map((p, i) => (<li key={`local-${p}-${i}`}><Typography variant="body2">{p}</Typography></li>))}
                                        </Box>
                                    </Grid>

                                    <Grid size={4}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Terminal</Typography>
                                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                            {grouped.Terminal.map((p, i) => (<li key={`term-${p}-${i}`}><Typography variant="body2">{p}</Typography></li>))}
                                        </Box>
                                    </Grid>

                                    <Grid size={4}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Enroute</Typography>
                                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                            {grouped.Enroute.map((p, i) => (<li key={`enr-${p}-${i}`}><Typography variant="body2">{p}</Typography></li>))}
                                        </Box>
                                    </Grid>
                                </Grid>
                            )}
                        </Paper>
                    </Box>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Grid size={12}>
                    <FinalPositionsTable title="Admin Positions" positions={adminFinalPositions} />
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Final Positions Table */}
                <Grid size={12}>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <FinalPositionsTable title="Local" positions={finalGrouped.Local} />
                        </Grid>
                        <Grid size={12}>
                            <FinalPositionsTable title="Terminal" positions={finalGrouped.Terminal} />
                        </Grid>
                        <Grid size={12}>
                            <FinalPositionsTable title="Enroute" positions={finalGrouped.Enroute} />
                        </Grid>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Grid size={12}>
                    <OpsPlanTmiTable tmis={tmisForDisplay} />
                </Grid>

                {event.opsFreeText ? (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Grid size={12}>
                            <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="h6">Other Notes</Typography>
                                </Stack>

                                {event.opsPlanPublished ? (
                                    <Box sx={{ mt: 1 }}>
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                                            <Markdown>{String(event.opsFreeText)}</Markdown>
                                        </Paper>
                                    </Box>
                                ) : (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            Ops plan is not published — preview (not visible to general users):
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default' }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {String(event.opsFreeText)}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </>
                ) : null}
            </Grid>
        </Grid>
    );
}
