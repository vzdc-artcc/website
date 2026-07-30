'use client';
import React, {use} from 'react';
import ProfileEditCard from "@/components/Profile/ProfileEditCard";
import RequireRole from "@/components/Access/RequireRole";

export default function Page(props: { params: Promise<{ cid: string }> }) {
    const {cid} = use(props.params);

    // Reachable from the training area (instructors/staff); the osmium
    // admin-profile + operating-initials endpoints are the write authority
    // (users.flags.update / users.operating_initials.update).
    return (
        <RequireRole check="isInstructor">
            <ProfileEditCard cid={Number(cid)} admin/>
        </RequireRole>
    );
}
