'use client';
import {Box, Skeleton} from "@mui/material";
import {useStaffPositionHolders} from "@/lib/osmium/hooks/staff-positions";

/**
 * A menu subheading naming a staff position's holder, e.g. "ATM: Jane Doe".
 * N/A means the request succeeded with no holder; loading and a failed request render differently.
 * Cached data wins over the query status: TanStack sets status 'error' when a background refetch
 * fails while the last good data is still cached, and that data is still right to show.
 */
export default function StaffHolderSubheading({label, position}: { label: string, position: string }) {
    const {status, data} = useStaffPositionHolders(position);

    if (!data && status === 'pending') {
        return <>{label}: <Skeleton variant="text" width={80} sx={{display: 'inline-block',}}/></>;
    }
    if (!data) {
        return <>{label}: <Box component="span" color="text.secondary">Unavailable</Box></>;
    }
    return <>{label}: {data.holders[0]?.display_name ?? 'N/A'}</>;
}
