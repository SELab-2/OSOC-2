import { NextPage } from "next";
import React from "react";
import { Students } from "../../components/Students/Students";
import { DragDropContext, DropResult } from "react-beautiful-dnd";

const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    return;
};
const Index: NextPage = () => {
    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Students alwaysLimited={false} dragDisabled={true} />
        </DragDropContext>
    );
};

export default Index;
