import React from 'react';
import RequireRole from "@/components/Access/RequireRole";

export default function Layout({children}: { children: React.ReactNode }) {

    return (
        <RequireRole check="isStaff">
            {children}
        </RequireRole>
    );
}
