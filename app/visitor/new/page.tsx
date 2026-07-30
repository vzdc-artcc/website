import React from 'react';
import {Container} from "@mui/material";
import VisitorApplicationView from "@/components/Visitor/VisitorApplicationView";
import VisitorEligibilityGate from "@/components/Visitor/VisitorEligibilityGate";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Visitor Request | vZDC',
    description: 'vZDC visitor request page',
};

export default function Page() {

    return (
        <VisitorEligibilityGate>
            <Container maxWidth="md">
                <VisitorApplicationView/>
            </Container>
        </VisitorEligibilityGate>
    );
}
