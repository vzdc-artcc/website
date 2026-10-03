'use client';
import React, {useState} from 'react';
import Link from "next/link";
import NavSidebarButton from "@/components/Sidebar/NavSidebarButton";
import NavSidebar from "@/components/Sidebar/NavSidebar";
import {NAVIGATION} from "@/lib/navigation";
import {Box, Divider} from "@mui/material";
import {ArrowBack} from "@mui/icons-material";

export default function NavSidebarButtons({onButtonClick,}: { onButtonClick: () => void, }) {

    const [openChildSidebar, setOpenChildSidebar] = useState<string>();

    return (
        <>
            {NAVIGATION.map((button, idx) => (
                <Box key={idx}>
                    <Link href={button.link || ''} style={{textDecoration: 'none', color: 'inherit',}}>
                        <NavSidebarButton icon={button.icon} text={button.label}
                                          onClick={() => {
                                              setOpenChildSidebar(idx.toString());
                                              if (button.link) {
                                                  onButtonClick();
                                              }
                                          }}
                                          isSidebar={!!button.dropdown}/>
                    </Link>
                    {button.dropdown && <NavSidebar open={idx.toString() === openChildSidebar} title={button.label}
                                                    onClose={() => {
                                                        setOpenChildSidebar(undefined);
                                                        onButtonClick();
                                                    }}>
                        <Divider/>
                        <NavSidebarButton icon={<ArrowBack/>} text="Back"
                                          onClick={() => {
                                              setOpenChildSidebar(undefined);
                                          }}/>
                        <Divider/>
                        {button.dropdown.buttons.map((dropdownButton, idx) => (
                            <Link key={idx} href={dropdownButton.link}
                                  style={{textDecoration: 'none', color: 'inherit',}}>
                                <NavSidebarButton icon={dropdownButton.icon} text={dropdownButton.label}
                                                  onClick={() => {
                                                      setOpenChildSidebar(undefined);
                                                      onButtonClick();
                                                  }}/>
                            </Link>
                        ))}
                    </NavSidebar>}
                </Box>
            ))}
        </>
    );
}