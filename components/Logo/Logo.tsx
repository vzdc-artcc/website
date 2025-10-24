import React from 'react';
import logo from '@/public/img/logo.png';
import Image from "next/image";
import Link from "next/link";
import {Box} from '@mui/material';

export default function Logo() {
    return (
        <>
            <Box sx={{display: {xs: 'none', sm: 'inherit',},}}>
                <Link href="/">
                    <Image src={logo} alt={"Washington ARTCC Logo"} width={250} height={45}/>
                </Link>
            </Box>
            <Box sx={{ display: { sm: 'none', }}}>
                <Link href="/">
                    <Image src={logo} alt={"Washington ARTCC Logo"} width={140} height={25}/>
                </Link>
            </Box>
        </>
    );
}