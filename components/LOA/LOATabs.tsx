'use client';
import React from 'react';
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {LOAStatus} from "@/generated/prisma/browser";
import {Tab, Tabs} from "@mui/material";

export default function LoaTabs() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const handleChange = (e: unknown, value: LOAStatus) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("status", value);
        router.push(`${pathname}?${newSearchParams.toString()}`, {
            scroll: true,
        });
    }

    const status = searchParams.get("status") || "PENDING";

    return (
        <Tabs variant="fullWidth" value={status as LOAStatus} onChange={handleChange}>
            <Tab label="Pending" value="PENDING"/>
            <Tab label="Approved/Active" value="APPROVED"/>
            <Tab label="Denied" value="DENIED"/>
            <Tab label="Inactive/Expired" value="INACTIVE"/>
        </Tabs>
    );
}