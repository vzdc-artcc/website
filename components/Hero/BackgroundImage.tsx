import React from 'react';
import Image from "next/image";
import bg from "@/public/img/home-bg.png";
import {Box} from "@mui/material";

export default function BackgroundImage() {
    return (
        <Box sx={{position: 'fixed', inset: 0, zIndex: -10, overflow: 'hidden', pointerEvents: 'none',}}>
            <Image src={bg} alt="" fill style={{objectFit: 'contain', opacity: 0.3,}}/>
        </Box>
    );
}