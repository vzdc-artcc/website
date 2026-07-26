'use client';
import EventPositionPresetForm from "@/components/EventPositionPreset/EventPositionPresetForm";
import {Box, Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {useParams} from "next/navigation";
import {useEventPositionPreset} from "@/lib/osmium/hooks/events";

export default function Page() {

    const params = useParams<{ id: string }>();
    const {data: positionPreset, isLoading} = useEventPositionPreset(params.id);

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    if (!positionPreset) {
        return <Typography textAlign="center" variant="h5">Preset not found.</Typography>;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Edit - {positionPreset.name}</Typography>
                <EventPositionPresetForm positionPreset={positionPreset}/>
            </CardContent>
        </Card>
    );
}
