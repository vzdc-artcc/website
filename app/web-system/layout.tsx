import React from 'react';
import {Metadata} from "next";
import WebSystemAdminMenu from "@/components/Admin/WebSystemAdminMenu";
import AdminLayout from "@/components/Admin/AdminLayout";

export const metadata: Metadata = {
    title: 'Webmaster | vZDC',
    description: 'vZDC web-system page',
};

export default async function Layout({children}: { children: React.ReactNode }) {
    return (
        <AdminLayout name="Web System Administration" sidebar={<WebSystemAdminMenu/>}
                     allowed={(user) => user.staffPositions.includes("WM") || user.roles.some(r => ["WEB_TEAM"].includes(r))}>
            {children}
        </AdminLayout>
    );
}