import {Card, CardContent, Grid, Stack, Typography} from "@mui/material";
import {Roboto} from "next/font/google";
import UpcomingEventsCarousel from "@/components/HomePage/UpcomingEventsCarousel";
import HeaderText from "@/components/Hero/HeaderText";
import BackgroundImage from "@/components/Hero/BackgroundImage";
import QuickLinksList from "@/components/Hero/QuickLinksList";
import UpcomingAtcCard from "@/components/HomePage/UpcomingAtcCard";
import OnlineAtcCard from "@/components/HomePage/OnlineAtcCard";
import TopControllersCard from "@/components/HomePage/TopControllersCard";
import SoloEndorsementsCard from "@/components/HomePage/SoloEndorsementsCard";

const headingFont = Roboto({subsets: ['latin'], weight: ['400']});

export default function Home() {
    return (
        (<Grid container columns={8} spacing={4}>
            <BackgroundImage/>
            <Grid size={8}>
                <Card>
                    <CardContent>
                        <HeaderText/>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 8, lg: 6}}>
                <Card sx={{height: 600,}}>
                    <CardContent>
                        <Typography {...headingFont.style} variant="h5" sx={{mb: 1,}}>Upcoming Events</Typography>
                        <UpcomingEventsCarousel/>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 8, lg: 2}}>
                <Card sx={{height: 600,}}>
                    <CardContent>
                        <Typography {...headingFont.style} variant="h5" sx={{mb: 1,}}>Quick Links</Typography>
                        <QuickLinksList/>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 8, lg: 2}}>
                <Stack direction="column" spacing={4} sx={{height: 600,}}>
                    <OnlineAtcCard/>
                    <UpcomingAtcCard/>
                </Stack>
            </Grid>
            <Grid size={{xs: 8, lg: 4}}>
                <TopControllersCard/>
            </Grid>
            <Grid size={{xs: 8, lg: 2}}>
                <SoloEndorsementsCard/>
            </Grid>
        </Grid>)
    );
}
