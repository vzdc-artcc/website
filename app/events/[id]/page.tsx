import React from 'react';
import EventDetailView from '@/components/Event/EventDetailView';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const {id} = await props.params;
    return <EventDetailView eventId={id}/>;
}
