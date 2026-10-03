import React from 'react';
import {Grid, Stack, Typography} from "@mui/material";
import {CertificationOption} from "@/generated/prisma/browser";
import {getIconForCertificationOption} from "@/lib/certification";

function RosterLegend() {
    return (
        <Grid container columns={10} spacing={2} justifyContent="center">
            {Object.values(CertificationOption).map((co: CertificationOption, idx) => (
                <Grid key={idx} size={{xs: 5, sm: 2, lg: 1,}}>
                    <Stack key={co} direction="column" alignItems="center">
                        {getIconForCertificationOption(co)}
                        <Typography variant="subtitle2">{co.replace('_', ' ')}</Typography>
                    </Stack>
                </Grid>
            ))}
        </Grid>
    );
}

export default RosterLegend;