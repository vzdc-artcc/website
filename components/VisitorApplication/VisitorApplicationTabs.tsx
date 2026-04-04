"use client";
import React from 'react';
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {Tab, Tabs} from "@mui/material";
import {VisitorApplicationStatus} from "@/generated/prisma/browser";

export default function VisitorApplicationTabs() {

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const handleChange = (e: unknown, value: VisitorApplicationStatus) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set("status", value);
        router.push(`${pathname}?${newSearchParams.toString()}`, {
            scroll: true,
        });
    }

    const status = searchParams.get("status") || "PENDING";

    return (
        <Tabs variant="fullWidth" value={status as VisitorApplicationStatus} onChange={handleChange}>
            <Tab label="Pending" value="PENDING"/>
            <Tab label="Approved" value="APPROVED"/>
            <Tab label="Denied" value="DENIED"/>
        </Tabs>
    );
}