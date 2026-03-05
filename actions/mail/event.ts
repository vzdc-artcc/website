'use server';
import {User} from "next-auth";
import {Event, EventPosition} from "@prisma/client";
import {FROM_EMAIL, mailTransport} from "@/lib/email";
import {eventPositionAssigned} from "@/templates/EventPosition/EventPositionAssigned";
import {eventPositionRemoved} from "@/templates/EventPosition/EventPositionRemoved";
import { positionRequestDeleted } from "@/templates/EventPosition/RequestDeleted";
import { newEventPosted } from "@/templates/Event/NewEventPosted";

export const sendEventPostedEmail = async (controller: User, event: Event) => {

    const {html} = await newEventPosted(controller, event);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: controller.email,
        subject: `New Event Posted: ${event.name}`,
        html,
    });
}

export const sendEventPositionEmail = async (controller: User, eventPosition: EventPosition, event: Event) => {

    function formatICalDate(input: Date | string) {
        const d = (input instanceof Date) ? input : new Date(input);
        if (Number.isNaN(d.getTime())) return '';
        return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }

    const uid = eventPosition?.id ? `${event.id}-${eventPosition.id}@vzdc.org` : `${event.id}-${Date.now()}@vzdc.org`;

    const icalContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//vZDC.org//vZDC Events\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nBEGIN:VEVENT\r\nSUMMARY:${event.name}\r\nUID:${uid}\r\nSTATUS:CONFIRMED\r\nDTSTART:${formatICalDate(event.start)}\r\nDTEND:${formatICalDate(event.end)}\r\nDTSTAMP:${formatICalDate(new Date())}\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`

    const {html} = await eventPositionAssigned(controller, eventPosition, event);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: controller.email,
        subject: `Event Position Assignment: ${event.name}`,
        html,
        attachments: [{
            filename: "event.ics",
            content: icalContent
        }],
    });

}

export const sendEventPositionRemovalEmail = async (controller: User, eventPosition: EventPosition, event: Event) => {

    const {html} = await eventPositionRemoved(controller, eventPosition, event);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: controller.email,
        subject: `Event Position Removal: ${event.name}`,
        html,
    });
}

export const sendEventPositionRequestDeletedEmail = async (controller: User, event: Event) => {
    
    const {html} = await positionRequestDeleted(controller, event);

    await mailTransport.sendMail({
        from: FROM_EMAIL,
        to: controller.email,
        subject: `Event Position Request Deleted: ${event.name}`,
        html,
    });
    
}