'use client';
import React, {use} from 'react';
import ProfileEditCard from "@/components/Profile/ProfileEditCard";
import RequireRole from "@/components/Access/RequireRole";

export default function Page(props: { params: Promise<{ cid: string }> }) {
    const {cid} = use(props.params);

    // The osmium admin-profile + operating-initials endpoints enforce the write
    // permission (users.flags.update / users.operating_initials.update); this
    // gate is the UX layer.
    return (
        <RequireRole check="isStaff">
            <ProfileEditCard cid={Number(cid)} admin/>
        </RequireRole>
    );
}
