import React from 'react';
import {Card, CardContent, CircularProgress, Typography} from "@mui/material";

export default function Loading() {
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Your ATC Bookings</Typography>
                <CircularProgress />
            </CardContent>
        </Card>
    );
}