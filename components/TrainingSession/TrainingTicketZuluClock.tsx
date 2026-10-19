"use client";
import React, {useEffect, useState} from 'react';
import {Stack, Typography} from "@mui/material";
import {Orbitron} from "next/font/google";

const clockFont = Orbitron({
    subsets: ["latin"],
    weight: ["700"],
});

function ZuluTime() {
    const [time, setTime] = useState({
        minutes: 0,
        hours: 0,
        seconds: 0,
    });

    useEffect(() => {
        const intervalId = setInterval(() => {
            const date = new Date();
            setTime({
                minutes: date.getUTCMinutes(),
                hours: date.getUTCHours(),
                seconds: date.getUTCSeconds(),
            })
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const convertToTwoDigit = (number: number) => {
        return number.toLocaleString('en-US', {
            minimumIntegerDigits: 2
        });
    };



    return (
        <Stack
            direction="row"
            sx={{
                justifyContent: "center",
                border: 1,
                padding: 1,
                minWidth: '15rem',
                marginLeft: "auto",
                marginBottom: "16px"
            }}>
            <Typography
                variant="h4"
                sx={{
                    textAlign: "center",
                    fontFamily: clockFont.style.fontFamily,
                    minWidth: '3.5rem'
                }}>{convertToTwoDigit(time.hours)}</Typography>
            <Typography variant="h4" sx={{
                fontFamily: clockFont.style.fontFamily
            }}>:</Typography>
            <Typography
                variant="h4"
                sx={{
                    textAlign: "center",
                    fontFamily: clockFont.style.fontFamily,
                    minWidth: '3.5rem'
                }}>{convertToTwoDigit(time.minutes)}</Typography>
            <Typography variant="h4" sx={{
                fontFamily: clockFont.style.fontFamily
            }}>:</Typography>
            <Typography
                variant="h4"
                sx={{
                    textAlign: "center",
                    fontFamily: clockFont.style.fontFamily,
                    minWidth: '3.5rem'
                }}>{convertToTwoDigit(time.seconds)}</Typography>
            <Typography variant="h4" sx={{
                fontFamily: clockFont.style.fontFamily
            }}>z</Typography>
        </Stack>
    );
}

export default ZuluTime;