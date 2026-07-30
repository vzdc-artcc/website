import EventManagerView from "@/components/EventManager/EventManagerView";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const {id} = await props.params;
    return <EventManagerView eventId={id}/>;
}
