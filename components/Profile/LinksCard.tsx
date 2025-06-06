import React from 'react';
import {Card, CardContent, List, ListItemButton, ListItemIcon, ListItemText, Typography} from "@mui/material";
import {AccessTime, Badge, Feedback, Route, Shield} from "@mui/icons-material";
import Link from "next/link";
/*

<ListItemButton sx={{border: 1, borderRadius: 8}}>
 */

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
                </List>
            </CardContent>
        </Card>
    );
}