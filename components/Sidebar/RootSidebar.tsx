'use client';
import React, {useEffect, useState} from 'react';
import NavSidebarButtons from "@/components/Sidebar/NavSidebarButtons";
import LoginButton from "@/components/Navbar/LoginButton";
import NavSidebar from "@/components/Sidebar/NavSidebar";
import {Session} from "next-auth";
import {useAdminMetadata} from "@/components/Admin/AdminSidebarContext";
import NavSidebarButton from "@/components/Sidebar/NavSidebarButton";
import {ArrowBack, Home, Menu} from "@mui/icons-material";
import {usePathname, useRouter} from "next/navigation";
import {Box, Divider} from "@mui/material";

function RootSidebar({session}: { session: Session | null, }) {

    const adminMeta = useAdminMetadata();
    const [showAdminMenu, setShowAdminMenu] = useState(true);
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        setShowAdminMenu(true);
    }, [pathname]);

    const adminView = showAdminMenu && !!adminMeta;

    let sidebarData;

    if (adminView) {
        sidebarData = (
            <>
                <Divider/>
                <NavSidebarButton icon={<Menu/>} text="Main Menu" onClick={() => setShowAdminMenu(false)}/>
                <Divider/>
                <Box onClick={(e) => (e.target as HTMLElement).closest('a') && setOpen(false)}>
                    {adminMeta.children}
                </Box>
            </>
        );
    } else {
        sidebarData = (
            <>
                {adminMeta ?
                    <>
                        <Divider/>
                        <NavSidebarButton icon={<ArrowBack/>} text={adminMeta.name}
                                          onClick={() => setShowAdminMenu(true)}/>
                        <Divider/>
                    </>
                    : <></>}
                <NavSidebarButton icon={<Home/>} text="Home" onClick={() => {
                    router.push("/");
                    setOpen(false);
                }}/>
                <NavSidebarButtons onButtonClick={() => setOpen(false)}/>
                <LoginButton session={session} sidebar sidebarButtonClicked={() => setOpen(false)}
                             sidebarAdminButtonClicked={() => setShowAdminMenu(true)}/>
            </>
        );
    }
    return (
        <NavSidebar openButton open={open} title={adminView ? adminMeta.name : "Main Menu"} onOpen={() => setOpen(true)}
                    onClose={() => {
                        setOpen(false);
                        setShowAdminMenu(true);
                    }}>
            {sidebarData}
        </NavSidebar>
    );
}

export default RootSidebar;