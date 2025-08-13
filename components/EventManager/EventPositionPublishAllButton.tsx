'use client';
import {publishEventPosition, unpublishEventPosition, validateFinalEventPosition} from "@/actions/eventPosition";
import {EventPositionWithSolo} from "@/app/events/admin/events/[id]/manager/page";
import {ZodErrorSlimResponse} from "@/types";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {Event,} from "@prisma/client";
import {User} from "next-auth";
import {useState} from "react";
import {toast} from "react-toastify";

export default function EventPositionPublishAllButton({ event, positions, }: { event: Event, positions: EventPositionWithSolo[], }) {

    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [errors, setErrors] = useState<EventPositionError[]>([]);

    const allPublished = positions.length > 0 && positions.every((position) => position.published);

    const handleClick = async () => {
        if (allPublished) {
            await Promise.all(positions.map(async (position) => {
                await unpublishEventPosition(event, position);
            }));
            toast.success('All positions unpublished successfully!');
            return;
        }

        const errors = await getErrors(event, positions);

        if (errors.length === 0) {
            await Promise.all(positions.map(async (position) => {
                if (!position.published) {
                    await publishEventPosition(event, {
                        ...position,
                        finalPosition: position.finalPosition || position.requestedPosition || 'ERR - CONTACT EVENT STAFF',
                    });
                }
            }));
            toast.success('All positions published successfully!');
        } else {
            setErrors(errors);
            setErrorDialogOpen(true);
        }
    }

    return (
        <>
            <Button variant={allPublished ? 'outlined' : 'contained'} color={allPublished ? 'error' : 'success'} disabled={!!event.archived || positions.length === 0} onClick={handleClick}>{allPublished ? 'Unp' : 'P'}ublish All</Button>
            <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
                <DialogTitle>Could Not Auto-Publish</DialogTitle>
                <DialogContent>
                    <ul>
                        {errors.map((error) => (
                            <li key={error.user.id}>
                                <DialogContentText>{error.user.firstName} {error.user.lastName}</DialogContentText>
                                <ul>
                                    {error.errors.map((error, index) => (
                                        <li key={index}><DialogContentText>{error}</DialogContentText></li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                    <DialogContentText>Fix these conflicts and try again.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setErrorDialogOpen(false)} variant="contained" size="small">Ok</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

type EventPositionError = {
    user: User;
    errors: string[];
}

const getErrors = async (event: Event, positions: EventPositionWithSolo[]): Promise<EventPositionError[]> => {
    
    if (positions.length === 0) {
        return [];
    }

    const errors: EventPositionError[] = [];

    for (const position of positions) {

        // check for duplicate positions
        const duplicate = positions.find((p) => p !== position && p.requestedPosition === position.requestedPosition);

        if (position.finalPosition !== duplicate?.finalPosition) {
            continue;
        if (!duplicate) {
            continue;
        }
        if (position.finalPosition !== duplicate.finalPosition) {
            continue;
        }

        if (duplicate && position.user) {
            if (errors.find((error) => error.user === position.user)) {
                errors.find((error) => error.user === position.user)?.errors.push(`Duplicate position ${position.requestedPosition}`);
            } else {
                errors.push({ user: position.user as User, errors: [`Duplicate position ${position.requestedPosition}`] });
            }
        }

        const modPosition = position;

        if (!position.finalPosition && event.presetPositions.includes(position.requestedPosition)) {
            modPosition.finalPosition = position.requestedPosition;
        } else if (!position.finalPosition && position.user) {
            if (errors.find((error) => error.user === position.user)) {
                errors.find((error) => error.user === position.user)?.errors.push('Final Position is required and cannot be autofilled because it is not one of the presets.');
            } else {
                errors.push({ user: position.user as User, errors: ['Final Position is required and cannot be autofilled because it is not one of the presets.'] });
            }
        }

        modPosition.finalStartTime = position.finalStartTime || position.requestedStartTime;
        modPosition.finalEndTime = position.finalEndTime || position.requestedEndTime;
        modPosition.finalNotes = position.finalNotes || '';

        const formData = new FormData();
        formData.set('finalPosition', modPosition.finalPosition || '');
        formData.set('finalStartTime', modPosition.finalStartTime.toISOString());
        formData.set('finalEndTime', modPosition.finalEndTime.toISOString());
        formData.set('finalNotes', modPosition.finalNotes);

        const parse = await validateFinalEventPosition(event, formData) as ZodErrorSlimResponse;

        if (parse.success) {
            continue;
        }
    
        for (const error of parse.errors) {
            if (errors.find((error) => error.user === position.user)) {
                errors.find((error) => error.user === position.user)?.errors.push(error.message);
            } else {
                errors.push({ user: position.user as User, errors: [error.message] });
            }
        }
    }

    return errors;
}
