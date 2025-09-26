import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";
import {SoloCertification} from "@prisma/client";
import {User} from "next-auth";
import {formatZuluDate} from "@/lib/date";

export const soloAdded = (controller: User, solo: SoloCertification) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={controller} headerText="Solo Endorsement Added">
            <p>You are now authorized to
                control <strong>{solo.position}</strong> until <strong>{formatZuluDate(solo.expires)}</strong></p>
            <br/>
            <p>Exceptions:</p>
            <p>You are <strong>not</strong> allowed to control during events involving this ARTCC.</p>
            <p>You <strong>must</strong> set your role to student in CRC when logging in to this position.</p>
            <br/>
            <p>The status of this solo endorsement can change at any time. Check <a
                href={`https://vzdc.org/profile/overview`}>your profile</a> for the most up to date information</p>
            <br/>
            <p>Enjoy,</p>
            <p>The vZDC Training Team</p>
            <p>training@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    )
}