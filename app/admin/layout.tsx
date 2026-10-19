import React from 'react';
import AdminMenu from "@/components/Admin/AdminMenu";
import {Metadata} from "next";
import AdminLayout from "@/components/Admin/AdminLayout";

export const metadata: Metadata = {
    title: 'Admin | vZDC',
    description: 'vZDC admin page',
};

export default async function Layout({children}: { children: React.ReactNode }) {
    return (
        <AdminLayout name="Facility Administration" sidebar={<AdminMenu/>}
                     allowed={(user) => user.roles.some(r => ["STAFF"].includes(r))}>
            {children}
        </AdminLayout>
    )
}