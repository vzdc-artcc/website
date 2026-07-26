import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import IncidentReportForm from "@/components/Incident/IncidentReportForm";
import RequireAuth from "@/components/Access/RequireAuth";

export default function Page() {

    return (
        <RequireAuth>
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 2,}}>New Incident Report</Typography>
                    <IncidentReportForm/>
                </CardContent>
            </Card>
        </RequireAuth>
    );
}
