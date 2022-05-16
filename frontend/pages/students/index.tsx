import { NextPage } from "next";
import React from "react";
import { Students } from "../../components/Students/Students";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { Student } from "../../types";

const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    return;
};
const update = (students: Student[]) => {
    return students;
};

const Index: NextPage = () => {
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Students
                alwaysLimited={false}
                dragDisabled={true}
                updateParentStudents={update}
            />
        </DragDropContext>
    );
};

export default Index;
