import {renderReactToMjml} from "@/actions/mjml";
import {User} from "next-auth";
import {Event} from "@prisma/client";
import SingleRecipientEmailWrapper from "../Wrapper/SingleRecipientEmailWrapper";
import {formatZuluDate} from "@/lib/date";

export const newEventPosted = (controller: User, event: Event) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={controller} headerText="New Event Posted">
            <p>A new event has been posted on the website!</p>
            <br />
            <p>Event Name: <b>{event.name}</b></p>
            <p>Event Type: <b>{event.type.toString().replace('_', ' ')}</b></p>
            <p>Event Start: <b>{formatZuluDate(event.start)}</b></p>
            <p>Event End: <b>{formatZuluDate(event.end)}</b></p>
            <br />
            <p>For more information, and to sign up, <a href={`https://vzdc.org/events/${event.id}`}>click here</a>.</p>
            <br />
            <p>Regards,</p>
            <p>The vZDC Events Team</p>
            <p>ec@vzdc.org</p>
            <br />
            <p>To stop receiving these emails, turn off the 'Receive NEW event notifications' switch in <a
                href="https://vzdc.org/profile/edit">your profile settings</a></p>
        </SingleRecipientEmailWrapper>
    )
}