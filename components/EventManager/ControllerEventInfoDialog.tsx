'use client';

import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import {BarChart, Person} from '@mui/icons-material';
import Link from 'next/link';
import {useUserByCid} from '@/lib/osmium/hooks/users';
import {
    useCertificationTypes,
    useUserCertifications,
    useUserSoloCertifications,
} from '@/lib/osmium/hooks/certifications';
import {useUserEventPositions} from '@/lib/osmium/hooks/events';
import {formatZuluDate} from '@/lib/date';

/** Event-position context shown in the controller info dialog. */
export interface ControllerEventInfo {
    userCid?: number | null;
    userName?: string | null;
    requestedPosition?: string | null;
    requestedSecondaryPosition?: string | null;
    notes?: string | null;
    finalPosition?: string | null;
    finalNotes?: string | null;
}

function Field({label, children}: { label: string, children: React.ReactNode }) {
    return (
        <Box sx={{mb: 2}}>
            <Typography variant="subtitle2" fontWeight={700}>{label}</Typography>
            <Typography variant="body2" color="text.secondary" component="div">{children}</Typography>
        </Box>
    );
}

/**
 * Read-only popup opened from a controller chip in the event positions table.
 * Shows the controller's status/solo/certifications and this event's requested,
 * final, and last-controlled-event context, plus links out to the controller's
 * event statistics and admin profile. Only mounted while open, so its queries
 * fire on click rather than once per table row.
 */
export default function ControllerEventInfoDialog({open, onClose, info}: {
    open: boolean,
    onClose: () => void,
    info: ControllerEventInfo,
}) {
    const cid = info.userCid ?? undefined;
    const {data: user} = useUserByCid(cid);
    const {data: certsData} = useUserCertifications(cid);
    const {data: typesData} = useCertificationTypes();
    const {data: soloData} = useUserSoloCertifications(cid);
    const {data: eventPositions} = useUserEventPositions(cid);

    const rating = user?.basic?.rating ?? '';
    const controllerStatus = user?.full?.profile?.controller_status ?? 'N/A';

    const certTypes = typesData?.items ?? [];
    const certs = certsData?.items ?? [];
    const heldCerts = certTypes
        .map((type) => ({
            name: type.name,
            option: certs.find((c) => c.certification_type_id === type.id)?.certification_option,
        }))
        .filter((c) => c.option && c.option !== 'NONE');

    const solos = soloData?.items ?? [];
    const lastEvent = eventPositions?.items?.[0];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogContent>
                <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2}}>
                    <Avatar><Person/></Avatar>
                    <Box sx={{flexGrow: 1}}>
                        <Typography variant="h6">{info.userName || 'Unknown'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            CID: {info.userCid ?? 'N/A'}{rating ? ` • ${rating}` : ''}
                        </Typography>
                    </Box>
                    {cid &&
                        <Link href={`/events/admin/controller/${cid}`} target="_blank" style={{textDecoration: 'none'}}>
                            <Button variant="contained" startIcon={<BarChart/>}>Event Statistics</Button>
                        </Link>}
                </Stack>
                <Divider sx={{mb: 2}}/>

                <Stack direction={{xs: 'column', md: 'row'}} spacing={4}>
                    <Box sx={{flex: 1}}>
                        <Field label="Controller status">{controllerStatus}</Field>
                        <Field label="Solo cert">
                            {solos.length === 0 ? 'None' : solos.map((s) => s.position).join(', ')}
                        </Field>
                        <Field label="Certifications">
                            {heldCerts.length === 0 ? 'None' : (
                                <Stack spacing={0.5}>
                                    {heldCerts.map((c, i) => <span key={i}>{c.name} &mdash; {c.option}</span>)}
                                </Stack>
                            )}
                        </Field>
                    </Box>
                    <Box sx={{flex: 1}}>
                        <Field label="Last controlled event">
                            {lastEvent ? (
                                <Stack spacing={0.25}>
                                    <span>Name - {lastEvent.event_title}</span>
                                    <span>Date - {formatZuluDate(new Date(lastEvent.event_starts_at))}</span>
                                    <span>Position - {lastEvent.final_position ?? 'N/A'}</span>
                                </Stack>
                            ) : 'N/A'}
                        </Field>
                        <Field label="Requested position for this event">
                            {info.requestedPosition || 'N/A'}
                            {info.requestedSecondaryPosition ? ` (secondary: ${info.requestedSecondaryPosition})` : ''}
                        </Field>
                        <Field label="Notes for this event">{info.notes || 'None'}</Field>
                        <Field label="Final position for this event">{info.finalPosition || 'N/A'}</Field>
                        <Field label="Final notes">{info.finalNotes || 'None'}</Field>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                {cid &&
                    <Link href={`/admin/controller/${cid}`} target="_blank" style={{textDecoration: 'none'}}>
                        <Button variant="contained">Open Profile</Button>
                    </Link>}
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
