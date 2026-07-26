'use client';
import React, {useState} from 'react';
import {signOut} from "next-auth/react";
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Typography
} from "@mui/material";
import {
    AdminPanelSettings,
    CalendarMonth,
    Cancel,
    Class,
    Login,
    Logout,
    Person,
    Radio,
    Refresh,
    Settings,
    Web
} from "@mui/icons-material";
import NavDropdown from "@/components/Navbar/NavDropdown";
import Link from "next/link";
import NavSidebarButton from "@/components/Sidebar/NavSidebarButton";
import NavButton from "@/components/Navbar/NavButton";
import NavSidebar from "@/components/Sidebar/NavSidebar";
import {usePathname} from "next/navigation";
import {toast} from "react-toastify";
import TeamspeakUidDialog from "@/components/TeamspeakUID/TeamspeakUidDialog";
import { osmium } from "@/lib/osmium/client";
import { useMe, useRefreshMyVatusa } from "@/lib/osmium/hooks/me";
import { deriveCoarseRoles } from "@/lib/osmium/coarseRoles";

export default function LoginButton({sidebar, sidebarButtonClicked,}: {
    sidebar?: boolean,
    sidebarButtonClicked?: () => void
}) {

    // Identity, nav visibility and Website Management all come from osmium's
    // /me now — osmium is the sole authority (Phase 6: no NextAuth session).
    const {data: me} = useMe();
    const isServerAdmin = me?.server_admin === true;
    const coarse = deriveCoarseRoles(me);
    const refreshVatusa = useRefreshMyVatusa();

    const [dropdownAnchor, setDropdownAnchor] = React.useState<null | HTMLElement>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [openTeamspeakUidDialog, setOpenTeamspeakUidDialog] = useState(false);
    const pathname = usePathname();
    const [accepted, setAccepted] = useState(false);

    const handleRefresh = async () => {
        if (!me) return;

        try {
            await refreshVatusa.mutateAsync();
        } catch {
            toast('Error refreshing account information.', {type: 'error'});
            return;
        }

        toast('Account information refreshed.', {type: 'success'});
    }

    const handleClick = (e: { currentTarget: HTMLElement | EventTarget | null, }) => {
        if (!me) {
            setOpenAlert(true);
        } else {
            setDropdownAnchor(e.currentTarget as HTMLElement);
            if (sidebar) {
                setSidebarOpen((prev) => !prev);
            }
        }
    };

    const handleAlertClose = () => {
        setOpenAlert(false);
        setAccepted(false);
    };

    const handleSignIn = () => {
        // Transitional dual-login: osmium's VATSIM OAuth runs first (so the
        // browser gets an osmium_session cookie for the new React Query
        // hooks), then app/auth/osmium-bridge continues into NextAuth's own
        // VATSIM sign-in so existing session-dependent pages/actions keep
        // working unchanged. Collapse to osmium-only once NextAuth is retired.
        const bridgeUrl = `${window.location.origin}/auth/osmium-bridge?dest=${encodeURIComponent(pathname)}`;
        const osmiumLoginUrl = `${process.env.NEXT_PUBLIC_OSMIUM_API_URL}/api/v1/auth/vatsim/login?return_to=${encodeURIComponent(bridgeUrl)}`;
        window.location.href = osmiumLoginUrl;
    };

    const closeDropdown = () => {
        setDropdownAnchor(null);
    }

    const logout = () => {
        // End both sessions together — otherwise a stale osmium_session
        // cookie would leave osmium-backed pages looking logged in after
        // the user "logs out" via NextAuth. See handleSignIn for context.
        osmium.POST("/api/v1/auth/logout").catch(() => {
            // Best-effort: still proceed with NextAuth sign-out even if
            // osmium's own session was already gone or unreachable.
        }).finally(() => {
            signOut({
                callbackUrl: pathname,
            }).then(() => {
                closeDropdown();
            });
        });
    }

    const handleChange = () => {
        if (!accepted) {
            setAccepted(true)
        } else {
            setAccepted(false)
        }
    }

    return (
        <>
            {me && <TeamspeakUidDialog open={openTeamspeakUidDialog}
                                            onClose={() => setOpenTeamspeakUidDialog(false)}/>}
            {sidebar && <NavSidebarButton icon={<Person/>}
                                          text={me ? (me.rating ? `${me.display_name} - ${me.rating}` : me.display_name) : 'Login'}
                                          isSidebar onClick={handleClick}/>}
            {me && <NavSidebar open={sidebarOpen} title="Account" onClose={() => setSidebarOpen(false)}>
                <Box onClick={() => {
                    setSidebarOpen(false);
                    sidebarButtonClicked && sidebarButtonClicked();
                }}>
                    {me &&
                        <Link href="/profile/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                            <NavSidebarButton icon={<Settings/>} text="Profile"/>
                        </Link>}
                    {coarse.isStaff &&
                        <Link href="/admin/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                            <NavSidebarButton icon={<AdminPanelSettings/>} text="Facility Administration"/>
                        </Link>}
                    {isServerAdmin &&
                        <Link href="/website-management/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                            <NavSidebarButton icon={<Web/>} text="Website Management"/>
                        </Link>}
                    {coarse.isMentor &&
                        <Link href="/training/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                            <NavSidebarButton icon={<Class/>} text="Training Administration"/>
                        </Link>}
                    {coarse.isEventStaff &&
                    <Link href="/events/admin/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                        <NavSidebarButton icon={<CalendarMonth />} text="Events Administration"/>
                    </Link>}
                    {me && <NavSidebarButton icon={<Radio/>} text="TeamSpeak UID" onClick={() => {
                        setOpenTeamspeakUidDialog(true);
                    }}/>}
                    <NavSidebarButton icon={<Refresh/>} text="Refresh VATUSA Account Information"
                                      onClick={handleRefresh}/>
                    <NavSidebarButton icon={<Logout/>} text="Logout" onClick={logout}/>
                </Box>
            </NavSidebar>}
            {!sidebar && <NavButton icon={null}
                                    text={me ? (me.rating ? `${me.display_name} - ${me.rating}` : me.display_name) : 'Login'}
                                    isDropdown dropdownOpen={!!dropdownAnchor} onClick={handleClick}/>}
            {!sidebar && <NavDropdown open={!!dropdownAnchor} anchorElement={dropdownAnchor} onClose={closeDropdown}>
                {me &&
                    <Link href="/profile/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                    <MenuItem onClick={closeDropdown}>
                        <ListItemIcon>
                            <Settings/>
                        </ListItemIcon>
                        <ListItemText>Profile</ListItemText>
                    </MenuItem>
                    </Link>}
                {coarse.isStaff &&
                    <Link href="/admin/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                        <MenuItem onClick={closeDropdown}>
                            <ListItemIcon>
                                <AdminPanelSettings/>
                            </ListItemIcon>
                            <ListItemText>Facility Administration</ListItemText>
                        </MenuItem>
                    </Link>}
                {isServerAdmin &&
                    <Link href="/website-management/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                        <MenuItem onClick={closeDropdown}>
                            <ListItemIcon>
                                <Web/>
                            </ListItemIcon>
                            <ListItemText>Website Management</ListItemText>
                        </MenuItem>
                    </Link>}
                {coarse.isMentor &&
                    <Link href="/training/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                        <MenuItem onClick={closeDropdown}>
                            <ListItemIcon>
                                <Class/>
                            </ListItemIcon>
                            <ListItemText>Training Administration</ListItemText>
                        </MenuItem>
                    </Link>}
                {coarse.isEventStaff &&
                <Link href="/events/admin/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                    <MenuItem onClick={closeDropdown}>
                        <ListItemIcon>
                            <CalendarMonth />
                        </ListItemIcon>
                        <ListItemText>Events Administration</ListItemText>
                    </MenuItem>
                </Link>}
                {me && <MenuItem onClick={() => {
                    setOpenTeamspeakUidDialog(true);
                    closeDropdown();
                }}>
                    <ListItemIcon>
                        <Radio/>
                    </ListItemIcon>
                    <ListItemText>TeamSpeak UID</ListItemText>
                </MenuItem>}
                <MenuItem onClick={handleRefresh}>
                    <ListItemIcon>
                        <Refresh/>
                    </ListItemIcon>
                    <ListItemText>Refresh VATUSA Account Information</ListItemText>
                </MenuItem>
                <MenuItem onClick={logout}>
                    <ListItemIcon>
                        <Logout/>
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                </MenuItem>
            </NavDropdown>}

            <Dialog
                open={openAlert}
                onClose={handleAlertClose}
            >
                <DialogTitle>Confirm Sign In</DialogTitle>
                <DialogContent>
                    <Typography> The information contained on all pages of this website is to be used for flight simulation purposes only on the VATSIM
                        network. It is not intended nor should it be used for real world navigation. This site is not affiliated with the FAA, NATCA,
                        the actual Washington ARTCC, or any governing aviation body. All content contained herein is approved only for use on the VATSIM network.
                    </Typography>
                    <br/>
                    <FormControlLabel control={<Checkbox color="success" onClick={handleChange}/>} label={
                        <Typography>I understand that <b>we are a virtual organization</b> and do NOT have any
                            affiliation with the FAA, ZDC, or any government agency.</Typography>
                    }/>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="error" onClick={handleAlertClose} startIcon={<Cancel/>}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="success" onClick={handleSignIn} startIcon={<Login/>} disabled={ !accepted } autoFocus>
                        Continue login
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

