'use client';
import React, {useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {Favorite} from "@mui/icons-material";
import Link from "next/link";

const donationUrl = process.env.NEXT_PUBLIC_DONATION_URL || '';

export default function DonationButton() {

    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <>
            <Button variant="contained" color="inherit" startIcon={<Favorite/>} size="small"
                    sx={{textAlign: 'center', width: '100%', maxWidth: 200,}} onClick={() => setOpen(true)}>
                Donate
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>Donate to the Virtual Washington ARTCC</DialogTitle>
                <DialogContent>
                    <DialogContentText gutterBottom>Thank you for considering a donation to vZDC! Your support helps us
                        maintain and improve our services, ensuring a better experience for all of our members on the
                        VATSIM network.</DialogContentText>
                    <DialogContentText gutterBottom><b>Donating to our organization is entirely voluntary and will not
                        provide you with any advantage or preferential treatment over other members.</b> All individuals
                        are treated equally, regardless of their donation status.</DialogContentText>
                    <DialogContentText gutterBottom>Click the button below to make a donation via PayPal. Any amount is
                        appreciated, and every contribution helps us continue our mission.</DialogContentText>
                    <br/>
                    <DialogContentText>From all of our staff here at vZDC: Thank you very much for your
                        donation!</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="inherit" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Link href={donationUrl} target="_blank">
                        <Button variant="contained" onClick={handleClose} startIcon={<Favorite/>} autoFocus>
                            Donate
                        </Button>
                    </Link>
                </DialogActions>
            </Dialog>
        </>

    );

}