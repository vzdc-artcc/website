'use client';
import React from 'react';
import logo from '@/public/img/logo.png';
import logoLight from '@/public/img/logo-light.png';
import Image from "next/image";
import Link from "next/link";
import {Box} from '@mui/material';
import {useColorScheme} from "@mui/material/styles";

export default function Logo() {

    const {colorScheme} = useColorScheme();

    const getLogo = () => {
        switch (colorScheme) {
            case 'dark':
                return logoLight;
            case 'light':
            default:
                return logo;
        }
    }

    return (
        <>
            <Box sx={{display: {xs: 'none', sm: 'inherit',},}}>
                <Link href="/">
                    <Image src={getLogo()} alt={"Washington ARTCC Logo"} width={250} height={45}/>
                </Link>
            </Box>
            <Box sx={{ display: { sm: 'none', }}}>
                <Link href="/">
                    <Image src={getLogo()} alt={"Washington ARTCC Logo"} width={140} height={25}/>
                </Link>
            </Box>
        </>
    );
}