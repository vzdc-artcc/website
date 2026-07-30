'use client';
import React, {useState} from 'react';
import {useRouter} from "next/navigation";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {ExpandMore, Search} from "@mui/icons-material";
import {useAccessCatalog, groupByTopLevelSegment} from "@/lib/osmium/hooks/access";

export default function Page() {
    const router = useRouter();
    const {data: catalog, isLoading, isError} = useAccessCatalog();
    const [cid, setCid] = useState('');

    const handleSearch = () => {
        const trimmed = cid.trim();
        if (!/^\d+$/.test(trimmed)) return;
        router.push(`/website-management/access/${trimmed}`);
    };

    const groups = groupByTopLevelSegment(catalog?.permissions ?? []);
    const groupNames = Object.keys(groups).sort();

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5" fontWeight={700}>Access Control</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2,}}>Look up a controller to view and manage their roles and permissions.</Typography>
                    <form action={handleSearch}>
                        <Stack direction="row" spacing={2}>
                            <TextField fullWidth variant="filled" label="Controller CID" value={cid}
                                       onChange={(e) => setCid(e.target.value)}/>
                            <Button type="submit" variant="contained" startIcon={<Search/>}>
                                View Permissions
                            </Button>
                        </Stack>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 2,}}>Permission Catalog</Typography>
                    {isLoading && <CircularProgress/>}
                    {isError && <Alert severity="error">Failed to load permission catalog.</Alert>}
                    {groupNames.map((group) => (
                        <Accordion key={group}>
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Typography sx={{fontWeight: 'bold',}}>{group}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1,}}>
                                    {groups[group].slice().sort().map((permission) => (
                                        <Chip key={permission} size="small" label={permission}/>
                                    ))}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </CardContent>
            </Card>
        </Stack>
    );
}
