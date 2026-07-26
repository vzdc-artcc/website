import React from 'react';
import LessonCriteriaDetailView from "@/components/Lesson/LessonCriteriaDetailView";

export default async function Page(props: { params: Promise<{ id: string, criteriaId: string }> }) {
    const {id, criteriaId} = await props.params;

    return <LessonCriteriaDetailView lessonId={id} criteriaId={criteriaId}/>;
}
