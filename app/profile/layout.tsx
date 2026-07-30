import React from 'react';
import {Metadata} from "next";
import BroadcastViewer from "@/components/BroadcastViewer/BroadcastViewer";
import RequireAuth from "@/components/Access/RequireAuth";

export const metadata: Metadata = {
    title: 'Profile | vZDC',
    description: 'vZDC profile page',
};

export default function Layout({children}: { children: React.ReactNode }) {

    return (
        <RequireAuth>
            <BroadcastViewer includeSeen/>
            {children}
        </RequireAuth>
    );
}
