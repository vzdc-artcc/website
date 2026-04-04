import {ChangeBroadcast} from "@/generated/prisma/client";
import {renderReactToMjml} from "@/actions/mjml";
import MultipleRecipientsEmailWrapper from "@/templates/Wrapper/MultipleRecipientsEmailWrapper";

export const broadcastPosted = (broadcast: ChangeBroadcast) => {
    return renderReactToMjml(
        <MultipleRecipientsEmailWrapper headerText={`New Broadcast: ${broadcast.title}`}>
            <p>Dear Controllers,</p>
            <br/>
            <p>A new broadcast has been posted on the website.</p>
            <p>For more information, and to agree to it, <a href={`https://vzdc.org/profile/overview`}>click here</a>.
            </p>
            <br/>
            <p>Thank you,</p>
            <p>The vZDC Staff</p>
            <p>staff@vzdc.org</p>
        </MultipleRecipientsEmailWrapper>
    )
}