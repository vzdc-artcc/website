import React from 'react';
import LessonCriteriaCellDetailView from "@/components/Lesson/LessonCriteriaCellDetailView";

export default async function Page(
    props: { params: Promise<{ id: string, criteriaId: string, cellId: string }> }
) {
    const {id, criteriaId, cellId} = await props.params;

    return <LessonCriteriaCellDetailView lessonId={id} criteriaId={criteriaId} cellId={cellId}/>;
}
