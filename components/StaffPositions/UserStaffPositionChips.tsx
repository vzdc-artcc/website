'use client';

import React from 'react';
import {useStaffPositions} from "@/lib/osmium/hooks/staff-positions";
import StaffPositionChips from "@/components/StaffPositions/StaffPositionChips";

export default function UserStaffPositionChips({cid, size = 'small'}: {
    cid: number,
    size?: 'small' | 'medium',
}) {
    const {data, isLoading, isError} = useStaffPositions(cid);

    if (isLoading || isError || !data?.positions.length) {
        return null;
    }

    return <StaffPositionChips positions={data.positions.map((p) => p.position)} size={size}/>;
}
