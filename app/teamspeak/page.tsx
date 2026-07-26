'use client';
import {Box, Button, Card, CardContent, Link, Stack, Typography} from "@mui/material";
import {useMe} from "@/lib/osmium/hooks/me";
import {Error} from "@mui/icons-material";

export default function Home() {

    const {data: me} = useMe();

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5" sx={{mb: 1,}}>Teamspeak Information</Typography>
                    <Typography>Teamspeak is used for all training and all controller communications,
                        but all members are welcome to join us in the teamspeak.</Typography>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6">TeamSpeak Rules</Typography>
                    <Box>
                        <ul>
                            <li>
                                <Typography variant="body2" mt={1}>All users must join TeamSpeak using the name
                                    associated with their VATSIM account.</Typography>
                            </li>
                            <li>
                                <Typography variant="body2" mt={1}>Anonymous users will be kicked with a warning and
                                    banned upon reconnecting anonymously.</Typography>
                            </li>
                            <li>
                                <Typography variant="body2" mt={1}>Teamspeak permissions are required to move within
                                    Teamspeak. Please contact a staff member to
                                    receive appropriate permissions. (If you are not a member of the VATUSA region,
                                    please provide your CID for rating verification).</Typography>
                            </li>
                            <li>
                                <Typography variant="body2" mt={1}>Streaming while controlling is allowed and encouraged
                                    although the audio from Teamspeak is
                                    not allowed for the privacy of other controllers. Streaming Teamspeak audio requires
                                    the written permission of the ATM
                                    (Contact the ATM at <Link href="mailto:atm@vzdc.org"
                                                              style={{color: '#29B6F6',}}> atm@vzdc.org</Link> for
                                    permission).
                                    Streaming audio without his/her permission may result in the loss of Teamspeak
                                    privileges.</Typography>
                            </li>
                            <li>
                                <Typography variant="body2" mt={1}>Controlling rooms are limited to controlling only.
                                    If a controller asks for you to leave, please do so.</Typography>
                            </li>
                            <li>
                                <Typography variant="body2" mt={1}>Use of Teamspeak is a privilege and can be revoked by
                                    a staff member at any time and for any reason.
                                    To appeal teamspeak bans, please contact the DATM at <Link
                                        href="mailto:datm@vzdc.org"
                                        style={{color: '#29B6F6',}}> datm@vzdc.org.</Link></Typography>
                            </li>
                        </ul>
                    </Box>

                </CardContent>
            </Card>
            {!me && <Card>
                <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Error color="error"/>
                        <Typography>Login to access TeamSpeak</Typography>
                    </Stack>
                </CardContent>
            </Card>}
            {me && <Card>
                <CardContent>
                    <Stack direction="column" spacing={1}>
                        <Typography variant="h6">TeamSpeak Connection Information</Typography>
                        <Link href="ts3server://ts.vzdc.org">
                            <Button variant="contained" size="large">Connect</Button>
                        </Link>
                        <Box>
                            <Typography variant="subtitle1">Server Address: ts.vzdc.org</Typography>
                            <Typography variant="subtitle1">Password: N/A</Typography>
                        </Box>
                        <Typography variant="subtitle2">By accessing the teamspeak server, you agree to the rules above
                            and understand what will happen if you break them.</Typography>
                    </Stack>
                </CardContent>
            </Card>}
        </Stack>
    );
}
