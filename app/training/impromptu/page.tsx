'use client';
import React, {useState} from 'react';
import {
    Alert,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Divider,
    FormControlLabel,
    Grid,
    List,
    ListItemButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import {toast} from 'react-toastify';
import RequirePermission from '@/components/Access/RequirePermission';
import {
    useAcceptImpromptuOffer,
    useCancelImpromptuOffer,
    useCreateImpromptuOffer,
    useImpromptuOffer,
    useImpromptuOffers,
} from '@/lib/osmium/hooks/impromptu';

const SESSION_TYPES: {value: string, label: string}[] = [
    {value: 'ground', label: 'GND'},
    {value: 'tower', label: 'TWR'},
    {value: 'approach', label: 'APP'},
    {value: 'center', label: 'CTR'},
];

function OfferForm() {
    const create = useCreateImpromptuOffer();
    const [types, setTypes] = useState<string[]>([]);
    const [now, setNow] = useState(true);
    const [when, setWhen] = useState('');
    const [notes, setNotes] = useState('');

    const toggle = (value: string) =>
        setTypes((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

    const submit = async () => {
        if (types.length === 0) {
            toast.error('Pick at least one position type');
            return;
        }
        try {
            await create.mutateAsync({
                session_types: types,
                available_at: now ? null : (when ? new Date(when).toISOString() : null),
                notes: notes.trim() || null,
            });
            toast.success('Impromptu offer posted to Discord');
            setTypes([]);
            setNotes('');
            setNow(true);
            setWhen('');
        } catch {
            toast.error('Failed to post offer (is the bot online and the impromptu channel configured?)');
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" sx={{mb: 1}}>Post an impromptu offer</Typography>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                    Pings the matching impromptu roles in Discord with a Claim button. Students claim;
                    you pick one below.
                </Typography>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {SESSION_TYPES.map((t) => (
                            <FormControlLabel
                                key={t.value}
                                control={<Checkbox checked={types.includes(t.value)} onChange={() => toggle(t.value)}/>}
                                label={t.label}
                            />
                        ))}
                    </Stack>
                    <FormControlLabel
                        control={<Checkbox checked={now} onChange={(e) => setNow(e.target.checked)}/>}
                        label="Available now"
                    />
                    {!now && (
                        <TextField
                            type="datetime-local" label="Available at" variant="filled"
                            slotProps={{inputLabel: {shrink: true}}}
                            value={when} onChange={(e) => setWhen(e.target.value)}
                        />
                    )}
                    <TextField
                        label="Notes (optional)" variant="filled" multiline minRows={2}
                        value={notes} onChange={(e) => setNotes(e.target.value)}
                    />
                    <Button variant="contained" onClick={submit} disabled={create.isPending}>
                        {create.isPending ? 'Posting…' : 'Post offer'}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}

function ClaimsPanel({offerId}: {offerId: string}) {
    const {data, isLoading} = useImpromptuOffer(offerId);
    const accept = useAcceptImpromptuOffer(offerId);
    const cancel = useCancelImpromptuOffer(offerId);

    if (isLoading || !data) {
        return <CircularProgress/>;
    }

    const open = data.status === 'open';

    const onAccept = async (userId: string) => {
        try {
            await accept.mutateAsync(userId);
            toast.success('Accepted — the student has been notified');
        } catch {
            toast.error('Failed to accept');
        }
    };
    const onCancel = async () => {
        try {
            await cancel.mutateAsync();
            toast.success('Offer cancelled');
        } catch {
            toast.error('Failed to cancel');
        }
    };

    return (
        <Card>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 1}}>
                    <Typography variant="h6">
                        Claims <Chip size="small" label={data.status} sx={{ml: 1}}/>
                    </Typography>
                    {open && (
                        <Button color="warning" onClick={onCancel} disabled={cancel.isPending}>
                            Cancel offer
                        </Button>
                    )}
                </Stack>
                <Divider sx={{mb: 1}}/>
                {data.claims.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No claims yet.</Typography>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Controller</TableCell>
                                <TableCell>Rating</TableCell>
                                <TableCell>Sessions</TableCell>
                                <TableCell>Last session</TableCell>
                                <TableCell>Claimed</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.claims.map((c) => (
                                <TableRow key={c.id} selected={c.status === 'accepted'}>
                                    <TableCell>{c.name} ({c.cid})</TableCell>
                                    <TableCell>{c.rating ?? '—'}{c.controller_status ? ` · ${c.controller_status}` : ''}</TableCell>
                                    <TableCell>{c.session_count}</TableCell>
                                    <TableCell>{c.last_session_at ? new Date(c.last_session_at).toLocaleDateString() : '—'}</TableCell>
                                    <TableCell>{new Date(c.claimed_at).toLocaleTimeString()}</TableCell>
                                    <TableCell align="right">
                                        {c.status === 'accepted' ? (
                                            <Chip size="small" color="success" label="Accepted"/>
                                        ) : open ? (
                                            <Button size="small" variant="contained"
                                                    disabled={accept.isPending}
                                                    onClick={() => onAccept(c.user_id)}>
                                                Accept
                                            </Button>
                                        ) : (
                                            <Chip size="small" label={c.status}/>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

function ImpromptuManager() {
    const {data, isLoading} = useImpromptuOffers();
    const [selected, setSelected] = useState<string | undefined>();

    return (
        <Grid container spacing={2}>
            <Grid size={{xs: 12, md: 4}}>
                <OfferForm/>
                <Card sx={{mt: 2}}>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 1}}>My recent offers</Typography>
                        {isLoading ? <CircularProgress/> : (
                            <List dense>
                                {(data?.items ?? []).map((o) => (
                                    <ListItemButton key={o.id} selected={selected === o.id}
                                                    onClick={() => setSelected(o.id)}>
                                        <Stack>
                                            <Typography variant="body2">
                                                {o.session_types.map((t) => t.toUpperCase()).join(', ')}
                                                {' · '}
                                                <Chip size="small" label={o.status} component="span"/>
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {o.claim_count} claim(s) · {new Date(o.created_at).toLocaleString()}
                                            </Typography>
                                        </Stack>
                                    </ListItemButton>
                                ))}
                                {(data?.items ?? []).length === 0 && (
                                    <Typography variant="body2" color="text.secondary">No offers yet.</Typography>
                                )}
                            </List>
                        )}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 12, md: 8}}>
                {selected ? <ClaimsPanel offerId={selected}/> : (
                    <Alert severity="info">Post an offer, or select one to review its claims.</Alert>
                )}
            </Grid>
        </Grid>
    );
}

export default function Page() {
    return (
        <RequirePermission perm="training.impromptu.create">
            <Typography variant="h4" sx={{mb: 2}}>Impromptu Sessions</Typography>
            <ImpromptuManager/>
        </RequirePermission>
    );
}
