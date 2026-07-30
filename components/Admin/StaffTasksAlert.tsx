'use client';
import React from 'react';
import StaffTasksAlertClient from "@/components/Admin/StaffTasksAlertClient";
import {useMe} from "@/lib/osmium/hooks/me";
import {useStaffPositions} from "@/lib/osmium/hooks/staff-positions";

const SENIOR_STAFF_POSITIONS = ['ATM', 'DATM', 'TA', 'WM'];

/**
 * Shows the pending-staff-tasks banner to senior staff (ATM/DATM/TA/WM),
 * gated on osmium's staff-position data (Phase 6) instead of the NextAuth
 * session's frozen `staffPositions`.
 */
export default function StaffTasksAlert() {
    const {data: me} = useMe();
    const {data: positions} = useStaffPositions(me?.cid ?? NaN);

    const isSeniorStaff = (positions?.positions ?? [])
        .some((p) => SENIOR_STAFF_POSITIONS.includes(p.position));

    if (!me || !isSeniorStaff) {
        return <></>;
    }

    return <StaffTasksAlertClient/>;
}
