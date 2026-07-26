import React from 'react';
import {Metadata} from "next";
import StatisticsLayoutClient from "@/components/Statistics/StatisticsLayoutClient";

export const metadata: Metadata = {
    title: 'Statistics | vZDC',
    description: 'vZDC stats page',
};

export default function Layout({children}: { children: React.ReactNode }) {
    return <StatisticsLayoutClient>{children}</StatisticsLayoutClient>;
}
