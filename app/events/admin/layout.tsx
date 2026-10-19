import React from 'react';
import {Metadata} from "next";
import EventsMenu from '@/components/Admin/EventsMenu';
import AdminLayout from "@/components/Admin/AdminLayout";

export const metadata: Metadata = {
    title: 'Events | vZDC',
    description: 'vZDC events admin page',
};

export default async function Layout({children}: { children: React.ReactNode }) {
    return (
        <AdminLayout name="Events Administration" sidebar={<EventsMenu/>}
                     allowed={(user) => user.roles.some(r => ["EVENT_STAFF", "STAFF"].includes(r))}>
            {children}
        </AdminLayout>
    );
}