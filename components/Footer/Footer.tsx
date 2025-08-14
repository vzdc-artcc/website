import React from 'react';
import {AppBar, Box, Container, Stack, Toolbar, Tooltip, Typography} from "@mui/material";
import Logo from "@/components/Logo/Logo";
import vatusa from "@/public/img/vatusa.png";
import vatsim from "@/public/img/vatsim.png";
import Image from "next/image";
import Link from "next/link";
import getConfig from "next/config";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import DonationButton from "@/components/Donation/DonationButton";

const DEV_MODE = process.env['DEV_MODE'] === 'true';

export default async function Footer() {

    const { publicRuntimeConfig } = getConfig();
    const session = await getServerSession(authOptions);

    return (
        <AppBar position="static" sx={{marginTop: 20}}>
            <Toolbar>
                <Container maxWidth="md" sx={{padding: 5,}}>
                    <Typography textAlign="center" gutterBottom>&copy; 2025 Virtual Washington Air Route Traffic Control
                        Center, All
                        Rights Reserved.</Typography>
                    <Typography textAlign="center" gutterBottom>A sub-division of VATUSA, a division of the
                        VATSIM network.</Typography>
                    <Link href="/misc/AvDr/" style={{color: 'inherit',textDecoration: 'none'}}>
                        <Typography textAlign="center" fontWeight={700} sx={{marginTop: 2,}}>NOT FOR REAL WORLD
                        USE
                        </Typography>
                    </Link>
                    <Stack direction={{xs: 'column', lg: 'row',}} spacing={5} justifyContent="center"
                           alignItems="center" sx={{marginTop: 3,}}>
                        <Link href="https://www.vatusa.net/" target="_blank">
                            <Image src={vatusa} alt="VATUSA" height={50}/>
                        </Link>
                        <Logo/>
                        <Link href="https://www.vatsim.net/" target="_blank">
                            <Image src={vatsim} alt="VATSIM" height={50}/>
                        </Link>
                    </Stack>
                    <Tooltip title={`Developed by ${publicRuntimeConfig?.author}`}>
                        <Box sx={{mt: 2, textAlign: 'center',}}>
                            <Link href="/changelog" style={{color: 'inherit',textDecoration: 'none'}}>
                                {DEV_MODE &&
                                    <Typography variant="subtitle2" color="limegreen">Development Build</Typography>}
                                {!DEV_MODE && <Typography>v{publicRuntimeConfig?.version}</Typography>}
                            </Link>
                        </Box>
                    </Tooltip>
                    <Box sx={{textAlign: 'center', my: 2,}}>
                        <DonationButton/>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{my: 2,}} justifyContent="center">
                        <Tooltip title={'vZDC Privacy Policy'}>
                            <Link href="/privacy" style={{color: 'inherit',}}>
                                <Typography textAlign="center">Privacy</Typography>
                            </Link>
                        </Tooltip>
                        <Typography>|</Typography>
                        <Tooltip title={'vZDC Website Public Repository'}>
                            <Link href="https://github.com/vZDC-ARTCC/website" style={{color: 'inherit',}}>
                                <Typography textAlign="center">GitHub</Typography>
                            </Link>
                        </Tooltip>
                        <Typography>|</Typography>
                        <Tooltip title={'License'}>
                            <Link href="/license" style={{color: 'inherit',}}>
                                <Typography textAlign="center">License</Typography>
                            </Link>
                        </Tooltip>
                        <Typography>|</Typography>
                        <Tooltip title={'Credits'}>
                            <Link href="/credits" style={{color: 'inherit',}}>
                                <Typography textAlign="center">Credits</Typography>
                            </Link>
                        </Tooltip>
                        <Typography>|</Typography>
                        <Tooltip title={'Status'}>
                            <Link href="https://status.vzdc.org/status/vzdc" style={{color: 'inherit',}}>
                                <Typography textAlign="center">Status</Typography>
                            </Link>
                        </Tooltip>
                    </Stack>
                    {session?.user &&
                        <Typography variant="subtitle1" fontSize={12} textAlign="center">All non-zulu times are
                            displayed in <b>{session.user.timezone}</b>. You can change this in &apos;Your
                            Profile&apos;.</Typography>}
                </Container>
            </Toolbar>
        </AppBar>
    );
}