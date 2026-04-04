import {Event, EventPosition} from "@/generated/prisma/client";
import {User} from "next-auth";
import {renderReactToMjml} from "@/actions/mjml";
import {formatZuluDate} from "@/lib/date";
import SingleRecipientEmailWrapper from "@/templates/Wrapper/SingleRecipientEmailWrapper";

export const eventPositionAssigned = (controller: User, eventPosition: EventPosition, event: Event) => {
    return renderReactToMjml(
        <SingleRecipientEmailWrapper recipient={controller} headerText="Event Position Notification">
            <p>We are pleased to inform you that you have been selected to
                control <strong>{eventPosition.finalPosition}</strong> for the following event: <strong>{event.name}</strong>.
            </p>
            <p>You are required to control from <strong>{formatZuluDate(eventPosition.finalStartTime || event.start)}</strong> to <strong>{formatZuluDate(eventPosition.finalEndTime || event.end)}</strong>.</p>
            <p>The event starts at <strong>{formatZuluDate(event.start)}</strong></p>
            <br/>
            <p>Important event reminders:</p>
            <p>Please be ready to control at least <strong>10</strong> minutes before the start time.</p>
            <p>If this event has a briefing, it will start <strong>30</strong> minutes before the start time unless
                otherwise announced.</p>
            <p><strong>Participation is mandatory</strong> unless you communicate with the events team prior to the
                start time. Violations will result in potential disciplinary action.</p>
            <br/>
            <p>For more information, check <a href="https://vzdc.org/profile/overview">your profile</a> or the <a
                href={`https://vzdc.org/events/${event.id}`}>event page</a>.</p>
            <br/>
            <p>Thank you for your time,</p>
            <p>The vZDC Events Team</p>
            <p>ec@vzdc.org</p>
        </SingleRecipientEmailWrapper>
    );
}