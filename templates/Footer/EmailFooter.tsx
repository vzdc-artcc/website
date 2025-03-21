import React from 'react';
import {User} from "next-auth";
import {MjmlColumn, MjmlImage, MjmlSection, MjmlText} from "@faire/mjml-react";

function EmailFooter({recipient}: { recipient?: User }) {
    return (
        <>
            <MjmlSection background-color="#500E0E" padding="20px">
                <MjmlColumn>
                    <MjmlText color="white" align="center">
                        &copy; 2025 Virtual Jacksonville ARTCC. All rights reserved.
                    </MjmlText>
                    <MjmlImage href="https://zjxartcc.org" src="https://zjxartcc.org/img/logo.png"
                               alt="Virtual Jacksonville ARTCC" width="150px"/>
                </MjmlColumn>
            </MjmlSection>
            <MjmlSection background-color="#500E0E">
                <MjmlColumn>
                    <MjmlText color="white" font-size="12px" align="center">
                        {recipient &&
                            <p>This email is intended for {recipient.firstName} {recipient.lastName} ({recipient.cid})
                                ONLY. If you believe that you received this email in error, contact the vZJX staff
                                immediately. This email is not related to any real life aviation bodies or the
                                F.A.A.</p>}
                        <p>Do not reply to this email unless it asks you to do so; this inbox might be unmonitored.</p>
                    </MjmlText>
                </MjmlColumn>
            </MjmlSection>
        </>

    );
}

export default EmailFooter;