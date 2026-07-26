'use client';
import {Button, Card, CardContent, Stack, Typography} from '@mui/material';
import {useMe} from "@/lib/osmium/hooks/me";
import {Error} from "@mui/icons-material";


export default function Page() {

    const {data: me} = useMe();

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5">Discord Information</Typography>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6">Our Discord Server is open to all VATSIM members.</Typography>
                    <Typography variant="body1" sx={{my: 1,}}>Join our Discord server to get the latest information on
                        events, training, and more!</Typography>
                    {me && <Button variant="contained" size="large" href='https://discord.com/invite/me9zury'>Join
                        Discord</Button>}
                    {!me &&
                        <Typography sx={{display: 'flex', alignItems: 'center', gap: 1,}}><Error color="error"/> Login
                            to access Discord</Typography>}
                </CardContent>
            </Card>
        </Stack>
    );
}
