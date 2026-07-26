'use client';
import {useReassignOperatingInitials} from "@/lib/osmium/hooks/users";
import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    Typography
} from "@mui/material";
import {useState} from "react";
import {toast} from "react-toastify";

export type OiController = {
    id: string;
    cid: number;
    firstName?: string | null;
    lastName?: string | null;
    rating?: string | null;
    operatingInitials?: string | null;
    controllerStatus?: string | null;
};

export default function OperatingInitialAssignmentItem({ initials, allControllers, }: { initials: string, allControllers: OiController[], }) {
    
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<string>('');
    const reassign = useReassignOperatingInitials();

    const handleSubmit = async () => {

        const u = allControllers.find((u) => u.id === user);

        if (!u) return;

        try {
            await reassign.mutateAsync({cid: Number(u.cid), operatingInitials: initials});
        } catch {
            toast.error('These operating initials are already in use.');
            return;
        }

        toast.success(`Successfully assigned ${initials} to ${u.firstName} ${u.lastName}`);
        setOpen(false);
    }

    return (
        <>
            <Grid
                key={initials}
                size={{
                    xs: 4,
                    sm: 3,
                    md: 2,
                    xl: 1
                }}>
                <Box sx={{border: 2, borderRadius: 2, cursor: 'pointer', }}>
                    <div onClick={() => setOpen(true)}>
                        <Typography textAlign="center" variant="body2">{initials}</Typography>
                    </div>
                </Box>
            </Grid>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Assign Operating Initials - {initials}</DialogTitle>
                <DialogContent>
                    <Autocomplete
                        options={allControllers}
                        getOptionLabel={(option) => `${option.firstName} ${option.lastName} - ${option.rating ?? ''} (${option.cid})`}
                        value={allControllers.find((u) => u.id === user) || null}
                        onChange={(event, newValue) => {
                            setUser(newValue ? newValue.id : '');
                        }}
                        renderInput={(params) => <TextField {...params} label="Controller"/>} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">Assign</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}