import React from 'react';
import {Card, CardContent, CircularProgress} from "@mui/material";

export default function Loading() {
    return (
        <Card>
            <CardContent>
                <CircularProgress />
            </CardContent>
        </Card>
    );
}