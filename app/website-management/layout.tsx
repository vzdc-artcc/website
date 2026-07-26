import React from 'react';
import {Metadata} from "next";
import WebsiteManagementGate from "@/components/Admin/WebsiteManagementGate";

export const metadata: Metadata = {
    title: 'Website Management | vZDC',
    description: 'vZDC website management portal',
};

export default function Layout({children}: { children: React.ReactNode }) {
    return <WebsiteManagementGate>{children}</WebsiteManagementGate>;
}
