import React from 'react';
import LessonEditView from "@/components/Lesson/LessonEditView";

export default async function Page(props: { params: Promise<{ id: string, }>, }) {
    const {id} = await props.params;

    return <LessonEditView lessonId={id}/>;
}
