import {Student} from "../../types/types";
import React from "react";
import {StudentCard} from "../StudentCard/StudentCard";

export const StudentOverview: React.FC<{ student: Student }> = ({student}) => {
    return (<>
            <StudentCard student={student}/>
        </>
    )
}
