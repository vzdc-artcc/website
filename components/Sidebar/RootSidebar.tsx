'use client';
import React, {useState} from 'react';
import NavSidebarButtons from "@/components/Sidebar/NavSidebarButtons";
import LoginButton from "@/components/Navbar/LoginButton";
import NavSidebar from "@/components/Sidebar/NavSidebar";

function RootSidebar() {

    const [open, setOpen] = useState(false);

    return (
        <NavSidebar openButton open={open} title="Main Menu" onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}>
            <NavSidebarButtons onButtonClick={() => setOpen(false)}/>
            <LoginButton sidebar sidebarButtonClicked={() => setOpen(false)}/>
        </NavSidebar>
    );
}

export default RootSidebar;