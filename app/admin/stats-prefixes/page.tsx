import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import StatisticsPrefixesForm from "@/components/StatisticsPrefixes/StatisticsPrefixesForm";

export default function Page() {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>Statistics Prefixes</Typography>
                <StatisticsPrefixesForm/>
            </CardContent>
        </Card>
    );
}