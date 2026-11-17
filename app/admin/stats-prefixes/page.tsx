import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import StatisticsPrefixesForm from "@/components/StatisticsPrefixes/StatisticsPrefixesForm";

export default function Page() {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 1,}}>Statistics Prefixes</Typography>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2,}}>
                    These prefixes only validate callsigns on typed ATC bookings. They do not affect
                    statistics, which count every live position vNAS assigns to ZDC (excluding ATIS).
                </Typography>
                <StatisticsPrefixesForm/>
            </CardContent>
        </Card>
    );
}