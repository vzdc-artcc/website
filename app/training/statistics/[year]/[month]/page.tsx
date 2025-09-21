import {Card, CardContent, Typography} from "@mui/material";
import React from "react";


export default async function Page(props: { params: Promise<{ year: string, month: string }> }) {
    const params = await props.params;

    const {year, month} = params;

    if (!Number(year) || Number(year) < 2000 || Number(year) > new Date().getFullYear() || Number(month) < 0 || Number(month) > 11) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h4">Invalid Timeframe</Typography>
                    <Typography sx={{mt: 1,}}>Year must be after 2000 and not after this year. Month must also be within
                        0-11 range.</Typography>
                </CardContent>
            </Card>
        );
    }



    return (
        <h1>Hello</h1>
    )
}