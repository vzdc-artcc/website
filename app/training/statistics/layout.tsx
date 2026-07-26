import React from 'react';
import {Metadata} from "next";
import TrainingStatsLayoutShell from "@/components/TrainingStatistics/TrainingStatsLayoutShell";

export const metadata: Metadata = {
    title: 'Training Statistics | vZDC',
    description: 'vZDC training stats page',
};

export default function Layout({children}: { children: React.ReactNode }) {
    return (
        <TrainingStatsLayoutShell>{children}</TrainingStatsLayoutShell>
    );
}
