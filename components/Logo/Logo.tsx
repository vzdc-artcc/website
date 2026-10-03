'use client';
import logo from '@/public/img/logo.png';
import logoLight from '@/public/img/logo-light.png';
import Image from 'next/image';
import Link from 'next/link';
import {Box} from '@mui/material';

export default function Logo() {
    return (
        <Link href="/" style={{display: 'inline-flex'}}>
            <Box
                component={Image}
                src={logo}
                alt="Washington ARTCC Logo"
                width={250}
                height={45}
                sx={(theme) => ({
                    display: 'block',
                    width: {xs: 140, sm: 250},
                    height: 'auto',
                    ...theme.applyStyles('dark', {display: 'none'}),
                })}
            />
            <Box
                component={Image}
                src={logoLight}
                alt="Washington ARTCC Logo"
                width={250}
                height={45}
                sx={(theme) => ({
                    display: 'none',
                    width: {xs: 140, sm: 250},
                    height: 'auto',
                    ...theme.applyStyles('dark', {display: 'block'}),
                })}
            />
        </Link>
    );
}