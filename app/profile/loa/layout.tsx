import React from 'react';
import {Container} from "@mui/material";
import FlagGate from "@/components/Access/FlagGate";

export default function Layout({children}: { children: React.ReactNode }) {

    return (
        <FlagGate flag="no_request_loas" deniedHeading="LOA"
                  deniedMessage="You are not allowed to access this page.">
            <Container maxWidth="md">
                {children}
            </Container>
        </FlagGate>
    );
}
