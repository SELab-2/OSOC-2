import React from "react";
import {Student} from "../../types/types";

export const StudentCard: React.FC<{ student: Student}> = ({student}) => {
    console.log(student)
    return (
        <div>
            <p>Dit is een student card</p>
        </div>
    )
}
