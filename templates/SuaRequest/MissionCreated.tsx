import React from 'react';
import {User} from "next-auth";
import {SuaBlock} from "@prisma/client";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";

export const missionCreated = (user: User, sua: SuaBlock) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={user} headerText="SUA Mission Created">
            <p>You have successfully created a SUA mission.</p>
            <p>Make sure to read through your mission and the disclaimer carefully. Mention your mission number to ATC,
                if online, to exercise this mission.</p>
            <br/>
            <p>You can see your mission details <a
                href={`https://vzdc.org/sua/details?missionId=${sua.id}`}>here</a>.</p>
            <br/>
            <p>Regards,</p>
            <p>The vZDC Staff</p>
            <p>staff@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    );
}