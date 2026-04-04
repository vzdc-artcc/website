import React from 'react';
import {Grid, Stack, Typography} from "@mui/material";
import {CertificationOption} from "@/generated/prisma/browser";
import {getIconForCertificationOption} from "@/lib/certification";

function RosterLegend() {
    return (
        <Grid container spacing={2} justifyContent="center" sx={{mb: 2,}}>
            {Object.values(CertificationOption).map((co: CertificationOption, idx) => (
                <Grid key={idx} size={1}>
                    <Stack key={co} direction="column" alignItems="center">
                        {getIconForCertificationOption(co)}
                        <Typography variant="subtitle2">{co}</Typography>
                    </Stack>
                </Grid>
            ))}
        </Grid>
    );
}

export default RosterLegend;