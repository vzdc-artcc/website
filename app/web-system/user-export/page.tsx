import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import UserDataExportForm from "@/components/UserDataExport/UserDataExportForm";

export default async function Page() {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>User Data Export</Typography>
                <UserDataExportForm/>
            </CardContent>
        </Card>
    );
}
