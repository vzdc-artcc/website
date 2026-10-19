'use client';
import React from 'react';
import {ListItemButton} from "@mui/material";
import Link from "next/link";
import {usePathname} from "next/navigation";

export default function AdminListItemButton({href, children,}: { href: string, children: React.ReactNode }) {

    const pathname = usePathname();

    return (
        <Link href={href} style={{textDecoration: 'none', color: 'inherit',}}>
            <ListItemButton selected={pathname.startsWith(href)}>
                {children}
            </ListItemButton>
        </Link>
    );
}