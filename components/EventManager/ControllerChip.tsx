'use client';

import React, {useMemo, useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import {getRating} from '@/lib/vatsim';

type UserShape = any;
type SoloCertShape = { position: string; expires: string | Date } | null;

export type CertificationShape = {
    id: string;
    certificationOption: string;
    certificationTypeId: string;
    certificationType?: { id: string; name?: string } | null;
};

export type EventInfo = {
    requestedPosition?: string | null;
    eventNotes?: string | null;
    finalPosition?: string | null;
    finalNotes?: string | null;
    assignedPosition?: string | null;
    lastControlledEvent?: {
        id?: string;
        name?: string;
        date?: string | Date | null;
        assignedPosition?: string | null;
    } | null;

    certifications?: CertificationShape[] | null;
};

export default function ControllerChip({
                                           user,
                                           soloCert,
                                           published,
                                           eventId,
                                           eventInfo,
                                       }: {
    user: UserShape;
    soloCert?: SoloCertShape;
    published?: boolean;
    eventId?: string;
    eventInfo?: EventInfo | null;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState<EventInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    const displayEventInfo = useMemo(() => eventInfo ?? fetched ?? null, [eventInfo, fetched]);

    const firstName = user?.firstName?.trim() ?? '';
    const lastInitial = user?.lastName ? `${user.lastName.trim().charAt(0).toUpperCase()}.` : '';
    const nameLabel = `${firstName}${lastInitial ? ' ' + lastInitial : ''}`.trim() || 'Unknown';
    const ratingLabel = getRating(user?.rating);
    const chipColor = published
        ? 'success'
        : soloCert
            ? 'error'
            : user?.controllerStatus === 'HOME'
                ? 'default'
                : 'secondary';
    const tooltipTitle = soloCert ? `${soloCert.position} • expires ${new Date(soloCert.expires).toUTCString()}` : '';

    const renderCertifications = (items?: CertificationShape[] | null) => {
        if (!items || items.length === 0) return <Typography variant="body2" color="text.secondary">None</Typography>;
        return (
            <Stack direction="column" spacing={1} flexWrap="wrap">
                {items.map((c) => {
                    const typeName = c.certificationType?.name || c.certificationTypeId || '';
                    const option = c.certificationOption || '';
                    return (
                        <Typography key={c.id} variant="body2" color="text.secondary">
                            {typeName ? <>{typeName}{' — '}</> : null}
                            {option}
                        </Typography>
                    );
                })}
            </Stack>

        );
    };

    const renderSection = (title: string, content: React.ReactNode) => (
        <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{title}</Typography>
            <Box sx={{ mt: 0.5 }}>{content}</Box>
        </Box>
    );

    return (
        <>
            <Tooltip
                title={tooltipTitle}
                disableHoverListener={!soloCert}
                disableFocusListener={!soloCert}
                disableTouchListener={!soloCert}
            >
                <Chip
                    label={`${nameLabel} - ${ratingLabel}`}
                    size="small"
                    color={chipColor as any}
                    onClick={() => setOpen(true)}
                    sx={{ cursor: 'pointer' }}
                />
            </Tooltip>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar src={user?.avatarUrl} alt={nameLabel} />
                        <Box>
                            <Typography variant="h6">{`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Unknown'}</Typography>
                            <Typography variant="body2" color="text.secondary">{`CID: ${user?.cid ?? 'N/A'} • ${ratingLabel}`}</Typography>
                        </Box>
                    </Stack>
                </DialogTitle>

                <DialogContent dividers>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : (
                        <Grid container spacing={2} columns={12}>
                            <Grid size={6}>
                                {renderSection('Controller status', <Typography color="text.secondary" variant="body2">{user?.controllerStatus ?? 'N/A'}</Typography>)}
                                {renderSection('Solo cert', soloCert ? (
                                    <Typography variant="body2" color="text.secondary">{soloCert.position} - Expires: {new Date(soloCert.expires).toLocaleString()}</Typography>
                                ) : <Typography variant="body2" color="text.secondary">None</Typography>)}
                                {renderSection('Certifications', renderCertifications(displayEventInfo?.certifications ?? (user as any)?.certifications ?? []))}
                            </Grid>

                            <Grid size={6}>
                                {renderSection('Last controlled event', displayEventInfo?.lastControlledEvent ? (
                                    <Stack spacing={0.5}>
                                        <Typography variant="body2" color="text.secondary">Name - {displayEventInfo.lastControlledEvent.name}</Typography>
                                        {displayEventInfo.lastControlledEvent.date && (
                                            <Typography variant="body2" color="text.secondary">Date - {new Date(displayEventInfo.lastControlledEvent.date).toLocaleString()}</Typography>
                                        )}
                                        {displayEventInfo.lastControlledEvent.assignedPosition && (
                                            <Typography variant="body2" color="text.secondary">Position -  {displayEventInfo.lastControlledEvent.assignedPosition}</Typography>
                                        )}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">No recent event</Typography>
                                ))}

                                <Divider sx={{ my: 1 }} />

                                {renderSection('Requested position for this event', <Typography color="text.secondary" variant="body2">{displayEventInfo?.requestedPosition ?? 'N/A'}</Typography>)}
                                {renderSection('Assigned position for this event', <Typography color="text.secondary" variant="body2">{displayEventInfo?.assignedPosition ?? 'N/A'}</Typography>)}
                                {renderSection('Notes for this event', <Typography color="text.secondary" variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{displayEventInfo?.eventNotes ?? 'None'}</Typography>)}
                                {renderSection('Final position for this event', <Typography color="text.secondary" variant="body2">{displayEventInfo?.finalPosition ?? 'N/A'}</Typography>)}
                                {renderSection('Final notes', <Typography color="text.secondary" variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{displayEventInfo?.finalNotes ?? 'None'}</Typography>)}
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => {
                            if (user?.cid) window.open(`/admin/controller/${user.cid}`, '_blank');
                        }}
                        variant="contained"
                        size="small"
                    >
                        Open profile
                    </Button>
                    <Button onClick={() => setOpen(false)} variant="contained" size="small">Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
