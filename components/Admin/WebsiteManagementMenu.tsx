'use client';
import React from 'react';
import {ListItemButton, ListItemIcon, ListItemText, ListSubheader} from "@mui/material";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {
    Campaign,
    Chat,
    CloudDownload,
    Description,
    Drafts,
    Folder,
    History,
    Home,
    MarkEmailUnread,
    Outbox,
    Security,
    Send,
    Sync,
    VpnKey
} from "@mui/icons-material";
import MenuWrapper from './MenuWrapper';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const SECTIONS: { heading?: string; items: NavItem[] }[] = [
    {
        items: [
            {href: '/website-management/overview', label: 'Overview', icon: <Home/>},
            {href: '/website-management/api-keys', label: 'API Keys', icon: <VpnKey/>},
            {href: '/website-management/access', label: 'Access Control', icon: <Security/>},
            {href: '/website-management/audit', label: 'Audit Log', icon: <History/>},
            {href: '/website-management/data-export', label: 'Data Export', icon: <CloudDownload/>},
            {href: '/website-management/files', label: 'Files', icon: <Folder/>},
            {href: '/website-management/jobs', label: 'Background Jobs', icon: <Sync/>},
        ],
    },
    {
        heading: 'Email',
        items: [
            {href: '/website-management/emails/templates', label: 'Email Templates', icon: <Description/>},
            {href: '/website-management/emails/send', label: 'Preview / Send Email', icon: <Send/>},
            {href: '/website-management/emails/mass', label: 'Mass Email', icon: <Campaign/>},
            {href: '/website-management/emails/outbox', label: 'Email Outbox', icon: <Drafts/>},
            {href: '/website-management/emails/resubscribe', label: 'Resubscribe', icon: <MarkEmailUnread/>},
        ],
    },
    {
        heading: 'Integrations',
        items: [
            {href: '/website-management/discord', label: 'Discord Integrations', icon: <Chat/>},
            {href: '/website-management/outbound-jobs', label: 'Outbound Jobs', icon: <Outbox/>},
        ],
    },
];

export default function WebsiteManagementMenu({displayName}: { displayName: string }) {
    const pathname = usePathname();

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    return (
        <MenuWrapper
            title="Website Management"
            subheadings={[`Signed in as: ${displayName}`]}
        >
            {SECTIONS.map((section, si) => (
                <React.Fragment key={section.heading ?? `section-${si}`}>
                    {section.heading && (
                        <ListSubheader
                            disableSticky
                            sx={{bgcolor: 'transparent', lineHeight: 2.2, mt: 1, fontSize: '0.7rem', letterSpacing: 1, textTransform: 'uppercase'}}
                        >
                            {section.heading}
                        </ListSubheader>
                    )}
                    {section.items.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link key={item.href} href={item.href} style={{textDecoration: 'none', color: 'inherit'}}>
                                <ListItemButton
                                    selected={active}
                                    sx={{
                                        borderRadius: 1.5,
                                        mb: 0.5,
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.main',
                                            color: 'primary.contrastText',
                                            '& .MuiListItemIcon-root': {color: 'primary.contrastText'},
                                            '&:hover': {bgcolor: 'primary.dark'},
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{minWidth: 40}}>{item.icon}</ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        slotProps={{primary: {fontWeight: active ? 600 : 400, variant: 'body2'}}}
                                    />
                                </ListItemButton>
                            </Link>
                        );
                    })}
                </React.Fragment>
            ))}
        </MenuWrapper>
    );
}
