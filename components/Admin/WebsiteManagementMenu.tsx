import React from 'react';
import {ListItemButton, ListItemIcon, ListItemText} from "@mui/material";
import Link from "next/link";
import {Chat, Description, Drafts, History, Home, MarkEmailUnread, Outbox, Security, Send, Sync, VpnKey} from "@mui/icons-material";
import MenuWrapper from './MenuWrapper';

export default function WebsiteManagementMenu({displayName}: { displayName: string }) {
    return (
        <MenuWrapper
            title="Website Management"
            subheadings={[`Signed in as: ${displayName}`]}
        >
            <Link href="/website-management/overview" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Home/>
                    </ListItemIcon>
                    <ListItemText primary="Overview"/>
                </ListItemButton>
            </Link>
            <Link href="/website-management/api-keys" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <VpnKey/>
                    </ListItemIcon>
                    <ListItemText primary="API Keys"/>
                </ListItemButton>
            </Link>
            <Link href="/website-management/access" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Security/>
                    </ListItemIcon>
                    <ListItemText primary="Access Control"/>
                </ListItemButton>
            </Link>
            <Link href="/website-management/audit" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <History/>
                    </ListItemIcon>
                    <ListItemText primary="Audit Log"/>
                </ListItemButton>
            </Link>
            <Link href="/website-management/jobs" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Sync/>
                    </ListItemIcon>
                    <ListItemText primary="Background Jobs"/>
                </ListItemButton>
            </Link>
            <Link href="/website-management/emails/templates" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Description/>
                    </ListItemIcon>
                    <ListItemText primary="Email Templates"/>
                </ListItemButton>
            </Link>
            <Link href="/website-management/emails/send" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Send/>
                    </ListItemIcon>
                    <ListItemText primary="Preview / Send Email"/>
                </ListItemButton>
            </Link>
            <Link href="/website-management/emails/outbox" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Drafts/>
                    </ListItemIcon>
                    <ListItemText primary="Email Outbox"/>
                </ListItemButton>
            </Link>
            <Link href="/website-management/emails/resubscribe" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <MarkEmailUnread/>
                    </ListItemIcon>
                    <ListItemText primary="Resubscribe"/>
                </ListItemButton>
            </Link>
            <Link href="/website-management/discord" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Chat/>
                    </ListItemIcon>
                    <ListItemText primary="Discord Integrations"/>
                </ListItemButton>
            </Link>
            <Link href="/website-management/outbound-jobs" style={{textDecoration: 'none', color: 'inherit',}}>
                <ListItemButton>
                    <ListItemIcon>
                        <Outbox/>
                    </ListItemIcon>
                    <ListItemText primary="Outbound Jobs"/>
                </ListItemButton>
            </Link>
        </MenuWrapper>
    );
}
