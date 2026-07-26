import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import SoloForm from "@/components/SoloCertification/SoloForm";
import SolosGate from "@/components/Access/SolosGate";

export default function Page() {
    return (
        <SolosGate>
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 2,}}>New Solo Endorsement</Typography>
                    {/* SoloForm self-sources controllers + solo-eligible certification types
                        from osmium and shows its own empty-state message. */}
                    <SoloForm/>
                </CardContent>
            </Card>
        </SolosGate>
    );
}
