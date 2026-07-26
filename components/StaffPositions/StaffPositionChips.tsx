import React from 'react';
import {Chip} from "@mui/material";

const colorPriority: Record<string, number> = {
    error: 1,
    info: 2,
    secondary: 3,
    success: 4,
    warning: 5,
    default: 6,
};

type ChipColor = 'error' | 'info' | 'secondary' | 'success' | 'warning' | 'default';

const getColor = (position: string): ChipColor => {
    switch (position) {
        case 'ATM':
        case 'DATM':
        case 'TA':
            return 'error';
        case 'WM':
        case 'EC':
        case 'FE':
            return 'info';
        case 'AFE':
        case 'AEC':
        case 'AWM':
            return 'secondary';
        case 'MTR':
            return 'warning';
        case 'INS':
            return 'success';
        default:
            return 'default';
    }
};

export default function StaffPositionChips({positions, size = 'small'}: {
    positions: string[],
    size?: 'small' | 'medium',
}) {
    const sorted = [...positions].sort((a, b) => colorPriority[getColor(a)] - colorPriority[getColor(b)]);

    return (
        <>
            {sorted.map((position) => (
                <Chip key={position} label={position} size={size} color={getColor(position)}
                      style={{margin: '2px'}}/>
            ))}
        </>
    );
}
