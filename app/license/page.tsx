import {Button, Card, CardContent, Grid, Typography} from "@mui/material";
import Link from "next/link";
import {Check, Close, Info, OpenInNew} from "@mui/icons-material";

export default async function Home() {

    return (
        (<Grid container columns={9} spacing={4}>
            <Grid size={9}>
                <Card>
                    <CardContent>
                        <Typography variant="h4">License Information</Typography>
                        <Typography variant="body2">This is not legal advice.
                            <Link href="https://docs.github.com/articles/licensing-a-repository/#disclaimer" style={{color: '#29B6F6',textDecoration: 'none'}}> Learn more
                                about repository licenses</Link></Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" sx={{mb: 1,}}>Permissions</Typography>
                        <Typography variant="body1" color="green" sx={{display: 'flex', gap: 1, alignItems: 'center',}}><Check/> Commercial
                            use</Typography>
                        <Typography variant="body1" color="green" sx={{display: 'flex', gap: 1, alignItems: 'center',}}><Check/> Modification</Typography>
                        <Typography variant="body1" color="green" sx={{display: 'flex', gap: 1, alignItems: 'center',}}><Check/> Distribution</Typography>
                        <Typography variant="body1" color="green" sx={{display: 'flex', gap: 1, alignItems: 'center',}}><Check/> Patent
                            use</Typography>
                        <Typography variant="body1" color="green" sx={{display: 'flex', gap: 1, alignItems: 'center',}}><Check/> Private
                            use</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" sx={{mb: 1,}}>Limitations</Typography>
                        <Typography variant="body1" color="red"
                                    sx={{display: 'flex', gap: 1, alignItems: 'center',}}><Close/>Private
                            use</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" sx={{mb: 1,}}>Conditions</Typography>
                        <Typography variant="body1" color="lightblue"
                                    sx={{display: 'flex', gap: 1, alignItems: 'center',}}><Info/> License and copyright
                            notice</Typography>
                        <Typography variant="body1" color="lightblue"
                                    sx={{display: 'flex', gap: 1, alignItems: 'center',}}><Info/> State
                            changes</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={9}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 1,}}>Apache License 3.0</Typography>
                        <Link href="https://www.apache.org/licenses/LICENSE-2.0.txt" target="_blank">
                            <Button variant="contained" color="primary" endIcon={<OpenInNew/>}>Full License</Button>
                        </Link>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>)
    );
}
