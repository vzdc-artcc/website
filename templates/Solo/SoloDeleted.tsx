import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";
import {SoloCertification} from "@prisma/client";
import {User} from "next-auth";

export const soloDeleted = (controller: User, solo: SoloCertification) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={controller} headerText="Solo Endorsement Removed">
            <p>Your solo endorsement for <strong>{solo.position}</strong> has been removed</p>
            <p>DO NOT control this position until you get re-certified or gain another solo endorsement.</p>
            <br/>
            <p>If you believe that this is an error, contact the vZDC Training Department.</p>
            <br/>
            <p>Regards,</p>
            <p>The vZDC Training Team</p>
            <p>training@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    );
}