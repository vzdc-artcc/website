import {Event} from "@/generated/prisma/client";
import {User} from "next-auth";
import {renderReactToMjml} from "@/actions/mjml";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";

export const positionRequestDeleted = (controller: User, event: Event) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={controller} headerText="Event Position Notification">
            <p>You request to control for <strong>{event.name}</strong> was deleted.</p>
            <br/>
            <p>If you believe this is an error, email the vZDC events department.</p>
            <br/>
            <p>For more information, check <a href="https://vzdc.org/profile/overview">your profile</a> or
                the <a
                    href={`https://vzdc.org/events/${event.id}`}>event page</a>.</p>
            <br/>
            <p>Regards,</p>
            <p>The vZDC Events Team</p>
            <p>ec@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    )
}