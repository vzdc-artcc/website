'use client';
import React, {useState} from 'react';
import {signIn, signOut} from "next-auth/react";
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
import {Session} from "next-auth";
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
import {getRating} from "@/lib/vatsim";
import NavSidebarButton from "@/components/Sidebar/NavSidebarButton";
import NavButton from "@/components/Navbar/NavButton";
import NavSidebar from "@/components/Sidebar/NavSidebar";
import {usePathname} from "next/navigation";
import {refreshAccountData} from "@/actions/user";
import {toast} from "react-toastify";
import TeamspeakUidDialog from "@/components/TeamspeakUID/TeamspeakUidDialog";

export default function LoginButton({session, sidebar, sidebarButtonClicked,}: {
    session: Session | null,
    sidebar?: boolean,
    sidebarButtonClicked?: () => void
}) {

    const [dropdownAnchor, setDropdownAnchor] = React.useState<null | HTMLElement>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [openTeamspeakUidDialog, setOpenTeamspeakUidDialog] = useState(false);
    const pathname = usePathname();
    const [accepted, setAccepted] = useState(false);

    const handleRefresh = async () => {
        if (!session) return;

        const error = await refreshAccountData(session?.user);
        if (error) {
            toast('Error refreshing account information.', {type: 'error'});
            return;
        }

        toast('Account information refreshed.', {type: 'success'});
    }

    const handleClick = (e: { currentTarget: HTMLElement | EventTarget | null, }) => {
        if (!session) {
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
        signIn('vatsim', {
            callbackUrl: pathname,
        }).then();
    };

    const closeDropdown = () => {
        setDropdownAnchor(null);
    }

    const logout = () => {
        signOut({
            callbackUrl: pathname,
        }).then(() => {
            closeDropdown();
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
            {session && <TeamspeakUidDialog user={session.user} open={openTeamspeakUidDialog}
                                            onClose={() => setOpenTeamspeakUidDialog(false)}/>}
            {sidebar && <NavSidebarButton icon={<Person/>}
                                          text={session ? `${session.user.fullName} - ${getRating(session.user.rating)}` : 'Login'}
                                          isSidebar onClick={handleClick}/>}
            {session && <NavSidebar open={sidebarOpen} title="Account" onClose={() => setSidebarOpen(false)}>
                <Box onClick={() => {
                    setSidebarOpen(false);
                    sidebarButtonClicked && sidebarButtonClicked();
                }}>
                    {session.user.roles.length > 0 &&
                        <Link href="/profile/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                            <NavSidebarButton icon={<Settings/>} text="Profile"/>
                        </Link>}
                    {session?.user.roles.some((r) => ["STAFF"].includes(r)) &&
                        <Link href="/admin/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                            <NavSidebarButton icon={<AdminPanelSettings/>} text="Facility Administration"/>
                        </Link>}
                    {session?.user.roles.some((r) => ["WEB_TEAM"].includes(r)) &&
                        <Link href="/web-system/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                            <NavSidebarButton icon={<Web/>} text="Web System Administration"/>
                        </Link>}
                    {session?.user.roles.some((r) => ["MENTOR", "INSTRUCTOR", "STAFF"].includes(r)) &&
                        <Link href="/training/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                            <NavSidebarButton icon={<Class/>} text="Training Administration"/>
                        </Link>}
                    {session?.user.roles.some((r) => ["EVENT_STAFF", "STAFF"].includes(r)) &&
                    <Link href="/events/admin/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                        <NavSidebarButton icon={<CalendarMonth />} text="Events Administration"/>
                    </Link>}
                    {session && <NavSidebarButton icon={<Radio/>} text="TeamSpeak UID" onClick={() => {
                        setOpenTeamspeakUidDialog(true);
                    }}/>}
                    <NavSidebarButton icon={<Refresh/>} text="Refresh VATUSA Account Information"
                                      onClick={handleRefresh}/>
                    <NavSidebarButton icon={<Logout/>} text="Logout" onClick={logout}/>
                </Box>
            </NavSidebar>}
            {!sidebar && <NavButton icon={null}
                                    text={session ? `${session.user.fullName} - ${getRating(session.user.rating)}` : 'Login'}
                                    isDropdown dropdownOpen={!!dropdownAnchor} onClick={handleClick}/>}
            {!sidebar && <NavDropdown open={!!dropdownAnchor} anchorElement={dropdownAnchor} onClose={closeDropdown}>
                {session?.user.controllerStatus !== "NONE" &&
                    <Link href="/profile/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                    <MenuItem onClick={closeDropdown}>
                        <ListItemIcon>
                            <Settings/>
                        </ListItemIcon>
                        <ListItemText>Profile</ListItemText>
                    </MenuItem>
                    </Link>}
                {session?.user.roles.some((r) => ["STAFF"].includes(r)) &&
                    <Link href="/admin/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                        <MenuItem onClick={closeDropdown}>
                            <ListItemIcon>
                                <AdminPanelSettings/>
                            </ListItemIcon>
                            <ListItemText>Facility Administration</ListItemText>
                        </MenuItem>
                    </Link>}
                {session?.user.roles.some((r) => ["WEB_TEAM"].includes(r)) &&
                    <Link href="/web-system/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                        <MenuItem onClick={closeDropdown}>
                            <ListItemIcon>
                                <Web/>
                            </ListItemIcon>
                            <ListItemText>Web-System Administration</ListItemText>
                        </MenuItem>
                    </Link>}
                {session?.user.roles.some((r) => ["MENTOR", "INSTRUCTOR", "STAFF"].includes(r)) &&
                    <Link href="/training/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                        <MenuItem onClick={closeDropdown}>
                            <ListItemIcon>
                                <Class/>
                            </ListItemIcon>
                            <ListItemText>Training Administration</ListItemText>
                        </MenuItem>
                    </Link>}
                {session?.user.roles.some((r) => ["EVENT_STAFF", "STAFF"].includes(r)) &&
                <Link href="/events/admin/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                    <MenuItem onClick={closeDropdown}>
                        <ListItemIcon>
                            <CalendarMonth />
                        </ListItemIcon>
                        <ListItemText>Events Administration</ListItemText>
                    </MenuItem>
                </Link>}
                {session && <MenuItem onClick={() => {
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

