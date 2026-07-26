import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import AuditLogTable from "@/components/Logs/AuditLogTable";

export default async function Page() {

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>Logs</Typography>
                <AuditLogTable/>
            </CardContent>
        </Card>
    );
}