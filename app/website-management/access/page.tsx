'use client';
import React from 'react';
import {useRouter} from "next/navigation";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Autocomplete,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    createFilterOptions,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {ExpandMore} from "@mui/icons-material";
import {useAccessCatalog, groupByTopLevelSegment} from "@/lib/osmium/hooks/access";
import {useAllUsers, type UserListItem} from "@/lib/osmium/hooks/users";

// Search by name OR cid, and cap rendered matches so the ~1.3k-user list stays snappy.
const filterUsers = createFilterOptions<UserListItem>({
    limit: 50,
    stringify: (u) => `${u.basic.name} ${u.basic.cid}`,
});

export default function Page() {
    const router = useRouter();
    const {data: catalog, isLoading, isError} = useAccessCatalog();
    const {data: users, isLoading: usersLoading} = useAllUsers();

    const groups = groupByTopLevelSegment(catalog?.permissions ?? []);
    const groupNames = Object.keys(groups).sort();

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5" fontWeight={700}>Access Control</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2,}}>Look up a controller to view and manage their roles and permissions.</Typography>
                    <Autocomplete
                        fullWidth
                        loading={usersLoading}
                        options={users ?? []}
                        filterOptions={filterUsers}
                        getOptionLabel={(u) => `${u.basic.name} (${u.basic.cid})`}
                        isOptionEqualToValue={(a, b) => a.basic.cid === b.basic.cid}
                        onChange={(_event, value) => {
                            if (value) router.push(`/website-management/access/${value.basic.cid}`);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="filled"
                                label="Search by name or CID"
                                slotProps={{
                                    input: {
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {usersLoading ? <CircularProgress size={18}/> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    },
                                }}
                            />
                        )}
                    />
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
