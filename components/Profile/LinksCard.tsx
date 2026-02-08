import React from 'react';
import {Box, Card, CardContent, List, ListItemButton, ListItemIcon, ListItemText, Typography} from "@mui/material";
import {AccessTime, Badge, Event, Feedback, Route, Shield} from "@mui/icons-material";
import Link from "next/link";
import DonationButton from "@/components/Donation/DonationButton";

export default function LinksCard() {
    return (
        <Card sx={{height: '100%',}}>
            <CardContent>
                <Typography variant="h6" sx={{mb: 2,}}>Quick Links</Typography>

                <List disablePadding>
                    <Link href="https://wkf.ms/4fqZt3O" target="_blank"
                          style={{color: 'inherit', textDecoration: 'none',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Feedback color="info"/>
                            </ListItemIcon>
                            <ListItemText primary="General Facility Feedback"/>
                        </ListItemButton>
                    </Link>
                    <Link href="https://wkf.ms/4jM2UWK" target="_blank"
                          style={{color: 'inherit', textDecoration: 'none',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Feedback color="info"/>
                            </ListItemIcon>
                            <ListItemText primary="Events Team Feedback"/>
                        </ListItemButton>
                    </Link>
                    <Link href="https://wkf.ms/3C3CEpl" target="_blank"
                          style={{color: 'inherit', textDecoration: 'none',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Feedback color="info"/>
                            </ListItemIcon>
                            <ListItemText primary="Publications Feedback"/>
                        </ListItemButton>
                    </Link>
                    <Link href="https://wkf.ms/4gqmZ2m" target="_blank"
                          style={{color: 'inherit', textDecoration: 'none',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Feedback color="info"/>
                            </ListItemIcon>
                            <ListItemText primary="Web Systems Feedback"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/prd" target="_blank" style={{color: 'inherit', textDecoration: 'none',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Route/>
                            </ListItemIcon>
                            <ListItemText primary="Preferred Routes Database"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/profile/bookings" style={{color: 'inherit', textDecoration: 'none',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Event />
                            </ListItemIcon>
                            <ListItemText primary="Your ATC Bookings"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/profile/loa/request" style={{color: 'inherit', textDecoration: 'none',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <AccessTime/>
                            </ListItemIcon>
                            <ListItemText primary="Request an LOA"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/incident/new" style={{color: 'inherit', textDecoration: 'none',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Shield/>
                            </ListItemIcon>
                            <ListItemText primary="New Incident Report"/>
                        </ListItemButton>
                    </Link>
                    <Link href="/controllers/staff" style={{color: 'inherit', textDecoration: 'none',}}>
                        <ListItemButton>
                            <ListItemIcon>
                                <Badge/>
                            </ListItemIcon>
                            <ListItemText primary="ARTCC Staff"/>
                        </ListItemButton>
                    </Link>
                    <Box sx={{textAlign: 'center', mt: 2,}}>
                        <DonationButton/>
                    </Box>
                </List>
            </CardContent>
        </Card>
    );
}
