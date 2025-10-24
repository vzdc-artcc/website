import {Card, CardContent, Grid2, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import {Roboto} from "next/font/google";
import prisma from "@/lib/db";
import UpcomingEventsCarousel from "@/components/HomePage/UpcomingEventsCarousel";
import {formatZuluDate, getDuration, getTimeIn} from "@/lib/date";
import {getRating} from "@/lib/vatsim";
import Link from "next/link";
import {OpenInNew, StackedLineChart,} from "@mui/icons-material";
import {getTop3Controllers} from "@/lib/hours";
import HeaderText from "@/components/Hero/HeaderText";
import BackgroundImage from "@/components/Hero/BackgroundImage";
import QuickLinksList from "@/components/Hero/QuickLinksList";
import {fetchAtcBookings} from "@/actions/atcBooking";

const headingFont = Roboto({subsets: ['latin'], weight: ['400']});

export default async function Home() {

    const upcomingEvents = await prisma.event.findMany({
        where: {
            start: {
                gt: new Date(),
            },
            hidden: false,
        },
        orderBy: {
            start: 'asc',
        },
        take: 5,
    });

    const imageUrls = Object.fromEntries(upcomingEvents.map((event) => {
        return [event.id, event.bannerKey ? `https://utfs.io/f/${event.bannerKey}` : '/img/logo_large.png'];
    }));


    const onlineAtc = await prisma.controllerPosition.findMany({
        where: {
            active: true,
        },
        include: {
            log: {
                include: {
                    user: true,
                },
            },
        },
    });

    const atcBookings = await fetchAtcBookings();
    const bookingUsers = typeof atcBookings !== 'string' ? await Promise.all(Array.from(atcBookings.map((b) => {
        return prisma.user.findUnique({
            where: {
                cid: b.cid + "",
            },
            select: {
                cid: true,
                firstName: true,
                lastName: true,
                rating: true,
            }
        })
    }))) : [];
    const trainingAppointments = typeof atcBookings !== 'string' ? await Promise.all(Array.from(atcBookings.filter((b) => b.type === 'training')).map((b) => {
        return prisma.trainingAppointment.findFirst({
            where: {
                atcBookingId: b.id + "",
            },
            select: {
                student: true,
                trainer: true,
                id: true,
                atcBookingId: true,
            },
        });
    })) : [];



    const soloCertifications = await prisma.soloCertification.findMany({
        where: {
            expires: {
                gt: new Date(),
            },
        },
        include: {
            controller: true,
        },
    });

    const top3Logs = await prisma.controllerLogMonth.findMany({
        where: {
            year: new Date().getFullYear(),
            month: new Date().getMonth(),
        },
        include: {
            log: {
                include: {
                    user: true
                }
            }
        }
    });

    const top3Controllers = getTop3Controllers(top3Logs);

    return (
        (<Grid2 container columns={8} spacing={4}>
            <BackgroundImage/>
            <Grid2 size={8}>
                <Card>
                    <CardContent>
                        <HeaderText/>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 8,
                    lg: 6
                }}>
                <Card sx={{height: 600,}}>
                    <CardContent>
                        <Typography {...headingFont.style} variant="h5" sx={{mb: 1,}}>Upcoming Events</Typography>
                        <UpcomingEventsCarousel events={upcomingEvents} imageUrls={imageUrls}/>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 8,
                    lg: 2
                }}>
                <Card sx={{height: 600,}}>
                    <CardContent>
                        <Typography {...headingFont.style} variant="h5" sx={{mb: 1,}}>Quick Links</Typography>
                        <QuickLinksList/>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 8,
                    lg: 2
                }}>
                <Stack direction="column" spacing={4} sx={{height: 600,}}>
                    <Card sx={{height: '50%', overflowY: 'auto',}}>
                        <CardContent>
                            <Typography {...headingFont.style} variant="h5" sx={{mb: 1,}}>Online ATC</Typography>
                            <Stack direction="column" spacing={1}>
                                {onlineAtc.length > 0 ? onlineAtc.map(position => (
                                    <Card elevation={0} key={position.position + position.log.userId}>
                                        <CardContent>
                                            <Stack direction="row" spacing={1} justifyContent="space-between">
                                                <Typography>{position.position}</Typography>
                                                <Typography>{getDuration(position.start, new Date())}</Typography>
                                            </Stack>
                                            <Link href={`/controllers/${position.log.user.cid}`}
                                                  style={{textDecoration: 'none', color: 'inherit',}}>
                                                <Typography
                                                    variant="subtitle2">{position.log.user.firstName} {position.log.user.lastName} - {getRating(position.log.user.rating)}</Typography>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                )) : <Typography>No controllers online</Typography>}
                            </Stack>
                        </CardContent>
                    </Card>
                    <Card sx={{height: '50%', overflowY: 'auto',}}>
                        <CardContent>
                            <Typography {...headingFont.style} variant="h5" sx={{mb: 1,}}>Upcoming ATC
                                <Link href="/bookings/calendar"
                                      style={{color: 'inherit', textDecoration: 'none',}}><OpenInNew fontSize="small"
                                                                                                     sx={{ml: 1,}}/></Link></Typography>
                            <Stack direction="column" spacing={1}>
                                {typeof atcBookings !== 'string' && atcBookings.length > 0 ? atcBookings.slice(0, 10).map((booking, i) => (
                                    <Card elevation={0} key={booking.id}>
                                        <CardContent>
                                            <Stack direction="row" spacing={1} justifyContent="space-between">
                                                <Typography fontWeight="bold">{booking.callsign}</Typography>
                                                <Tooltip arrow
                                                         title={`${formatZuluDate(new Date(booking.start.replace(" ", "T") + "Z"))} | Duration: ${getDuration(new Date(booking.start), new Date(booking.end))}`}>
                                                    <Typography>{getTimeIn(new Date(booking.start.replace(" ", "T") + "Z"))}</Typography>
                                                </Tooltip>
                                            </Stack>
                                            <Typography>{bookingUsers[i]?.firstName} {bookingUsers[i]?.lastName} ({getRating(bookingUsers[i]?.rating || 1)})</Typography>
                                            {booking.type === 'training' && <Typography
                                                variant="caption">Student: {trainingAppointments.find((a) => a?.atcBookingId === booking.id + "")?.student.firstName} {trainingAppointments.find((a) => a?.atcBookingId === booking.id + "")?.student.lastName} {getRating(trainingAppointments.find((a) => a?.atcBookingId === booking.id + "")?.student.rating || 1)}</Typography>}
                                        </CardContent>
                                    </Card>
                                )) : <Typography>No upcoming ATC bookings</Typography>}
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Grid2>
            <Grid2
                size={{
                    xs: 8,
                    lg: 4
                }}>
                <Card sx={{height: 600, overflowY: 'auto',}}>
                    <CardContent>
                        <Typography {...headingFont.style} variant="h5" sx={{mb: 1,}}>Top 3 Controllers</Typography>
                        <Stack direction="column" spacing={1}>
                            {top3Controllers.map((controller, idx) => (
                                <Card elevation={0} key={controller.user.cid}>
                                    <CardContent>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography
                                                variant="h5">{idx + 1} - {controller.user.preferredName || `${controller.user.firstName} ${controller.user.lastName}`}</Typography>
                                            <Tooltip title="View Statistics for this controller">
                                                <Link
                                                    href={`/controllers/statistics/${new Date().getFullYear()}/-/${controller.user.cid}`}
                                                    style={{color: 'inherit', textDecoration: 'none',}}>
                                                    <IconButton size="large">
                                                        <StackedLineChart fontSize="large"/>
                                                    </IconButton>
                                                </Link>
                                            </Tooltip>
                                        </Stack>
                                        <Typography
                                            variant="subtitle2">{controller.hours.toPrecision(3)} hours</Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 8,
                    lg: 2
                }}>
                <Card sx={{height: 600, overflowY: 'auto',}}>
                    <CardContent>
                        <Typography {...headingFont.style} variant="h5" sx={{mb: 1,}}>Solo Endorsements</Typography>
                        <Stack direction="column" spacing={1}>
                            {soloCertifications.length > 0 ? soloCertifications.map(solo => (
                                <Card elevation={0} key={solo.id}>
                                    <CardContent>
                                        <Typography variant="h6">{solo.position}</Typography>
                                        <Typography variant="body2">Expires {solo.expires.toDateString()}</Typography>
                                        <Link href={`/controllers/${solo.controller.cid}`}
                                              style={{textDecoration: 'none', color: 'inherit',}}>
                                            <Typography
                                                variant="subtitle2">{solo.controller.firstName} {solo.controller.lastName} - {getRating(solo.controller.rating)}</Typography>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )) : <Typography>No active solo endorsements</Typography>}
                        </Stack>
                    </CardContent>
                </Card>
            </Grid2>
        </Grid2>)
    );
}
