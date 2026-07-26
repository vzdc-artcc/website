import React from 'react';
import {Container} from "@mui/material";
import {Metadata} from "next";
import EventListView from "@/components/Event/EventListView";

export const metadata: Metadata = {
    title: 'Events | vZDC',
    description: 'vZDC events page',
};

export default function Page() {

    return (
        <Container maxWidth="lg">
            <EventListView/>
        </Container>
    );

}
