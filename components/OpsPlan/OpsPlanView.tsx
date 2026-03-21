import React from 'react';
import { fetchFullEvent } from "@/actions/opsPlan";
import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid2,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import { eventGetDuration, formatZuluDate } from "@/lib/date";
import { OpenInNew } from "@mui/icons-material";
import Link from "next/link";
import { notFound } from "next/navigation";
import { classifyPosition } from "@/actions/classifyPosition";
import Markdown from "react-markdown";

type Props = {
    eventId: string;
};

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

    // return as a React fragment (React.ReactNode)
    return <>{chips}</>;
}

type CategoryKey = 'Local' | 'Terminal' | 'Enroute';

function getCategoryForPosition(p: any): CategoryKey {
    // Prefer explicit controllingCategory if present and meaningful
    if (p && p.controllingCategory) {
        const up = String(p.controllingCategory).toUpperCase();
        if (up === 'ENROUTE' || up === 'CTR') return 'Enroute';
        if (up === 'TERMINAL' || up === 'APP') return 'Terminal';
        return 'Local';
    }

    // Fallback: use the finalPosition or requestedPosition string via classifyPosition
    const posLabel = (p && (p.finalPosition || p.requestedPosition)) ? String(p.finalPosition || p.requestedPosition) : '';
    try {
        const cat = classifyPosition(posLabel || '');
        // classifyPosition in your code returns 'Local'|'Terminal'|'Enroute', so return as-is.
        if (cat === 'Local' || cat === 'Terminal' || cat === 'Enroute') return cat;
    } catch (e) {
        // ignore and fallthrough
    }
    return 'Terminal'; // safe default
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
                                const posLabel = p.finalPosition || p.requestedPosition || 'Unknown';
                                const start = p.finalStartTime ? formatZuluDate(p.finalStartTime) : (p.requestedStartTime ? formatZuluDate(p.requestedStartTime) : '');
                                const end = p.finalEndTime ? formatZuluDate(p.finalEndTime) : (p.requestedEndTime ? formatZuluDate(p.requestedEndTime) : '');
                                const notes = p.finalNotes || p.notes || '';

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
                                                    {user.rating ? <Typography variant="caption" color="text.secondary">Rating: {user.rating}</Typography> : null}
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
                                                    {notes || <span style={{ color: 'rgba(0,0,0,0.6)' }}>No notes</span>}
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
    const event = await fetchFullEvent(eventId);
    if (!event) return notFound();

    const configs = parseFeaturedConfigs(event.featuredFieldConfigs);
    const featured = Array.isArray(event.featuredFields) ? event.featuredFields.map((f: string) => f.toUpperCase()) : [];

    const preset = Array.isArray(event.presetPositions) ? event.presetPositions : [];

    // compute groups (reset first if needed)
    const grouped: Record<'Local'|'Terminal'|'Enroute', string[]> = {
        Local: [],
        Terminal: [],
        Enroute: [],
    };

    for (const pos of preset) {
        const cat = classifyPosition(pos);
        grouped[cat].push(pos);
    }

    // compute final positions (already present)...
    const finalPositions = Array.isArray((event as any).positions)
        ? (event as any).positions.filter((p: any) =>
            (p.finalPosition !== undefined && p.finalPosition !== null)
            || p.finalPosition === ''
            || p.finalStartTime
            || p.finalEndTime
            || p.finalNotes
        )
        : [];

    // group final positions into categories (Local / Terminal / Enroute)
    const finalGrouped: Record<CategoryKey, any[]> = {
        Local: [],
        Terminal: [],
        Enroute: [],
    };

    for (const p of finalPositions) {
        const cat = getCategoryForPosition(p);
        finalGrouped[cat].push(p);
    }


    return (
        <Grid2 container spacing={2} columns={12}>
            <Grid2 size={12}>
                <Box sx={{ flexGrow: 1 }}>
                    <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography variant="h4">{event.name} - OPS Plan</Typography>
                            <Typography>START &nbsp;{formatZuluDate(event.start)} (IN {eventGetDuration(new Date(), event.start, true).toFixed(2)} days)</Typography>
                            <Typography>END &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{formatZuluDate(event.end)} (+{eventGetDuration(event.start, event.end).toFixed(2)} hours)</Typography>
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
            </Grid2>

            <Grid2 size={12}>
                <Grid2 container spacing={2}>
                    {featured.length === 0 ? (
                        <Grid2 size={12}>
                            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                <Typography variant="body1">No featured fields for this event.</Typography>
                            </Box>
                        </Grid2>
                    ) : (
                        featured.map((field) => {
                            const cfg = getConfigForField(field, configs);
                            const display = cfg == null ? 'No configuration provided.' :
                                typeof cfg === 'string' ? cfg : JSON.stringify(cfg, null, 2);

                            return (
                                <Grid2 key={field} size={4}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{field}</Typography>
                                            <Typography variant="body2" sx={{ mb: 1 }}>{display}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid2>
                            )
                        })
                    )}
                </Grid2>

                <Divider sx={{ my: 4 }} />

                <Grid2 size={12}>
                    <Box>
                        <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <Typography variant="h6">Planned Staffing</Typography>

                            {preset.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    No preset positions defined for this event.
                                </Typography>
                            ) : (
                                <Grid2 container spacing={2} sx={{ mt: 1 }}>
                                    <Grid2 size={4}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Local</Typography>
                                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                            {grouped.Local.map((p, i) => (<li key={`local-${p}-${i}`}><Typography variant="body2">{p}</Typography></li>))}
                                        </Box>
                                    </Grid2>

                                    <Grid2 size={4}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Terminal</Typography>
                                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                            {grouped.Terminal.map((p, i) => (<li key={`term-${p}-${i}`}><Typography variant="body2">{p}</Typography></li>))}
                                        </Box>
                                    </Grid2>

                                    <Grid2 size={4}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Enroute</Typography>
                                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                            {grouped.Enroute.map((p, i) => (<li key={`enr-${p}-${i}`}><Typography variant="body2">{p}</Typography></li>))}
                                        </Box>
                                    </Grid2>
                                </Grid2>
                            )}
                        </Paper>
                    </Box>
                </Grid2>

                <Divider sx={{ my: 2 }} />

                {/* Final Positions Table */}
                <Grid2 size={12}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={12}>
                            <FinalPositionsTable title="Local" positions={finalGrouped.Local} />
                        </Grid2>
                        <Grid2 size={12}>
                            <FinalPositionsTable title="Terminal" positions={finalGrouped.Terminal} />
                        </Grid2>
                        <Grid2 size={12}>
                            <FinalPositionsTable title="Enroute" positions={finalGrouped.Enroute} />
                        </Grid2>
                    </Grid2>
                </Grid2>
                {/* Ops Plan Free Text */}
                {event.opsFreeText ? (
                    <>
                        <Divider sx={{ my: 4 }} />

                        <Grid2 size={12}>
                            <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="h6">Other Notes</Typography>
                                </Stack>

                                {event.opsPlanPublished ? (
                                    // Published => render full markdown
                                    <Box sx={{ mt: 1 }}>
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                                            <Markdown>{String(event.opsFreeText)}</Markdown>
                                        </Paper>
                                    </Box>
                                ) : (
                                    // Unpublished => show preview only when there's text (we are inside event.opsFreeText truthy)
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
                        </Grid2>
                    </>
                ) : null}
            </Grid2>
        </Grid2>
    );
}
