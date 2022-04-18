import { Display, Student } from "../../types/types";
import React, { useContext, useEffect, useState } from "react";
import { StudentCard } from "../StudentCard/StudentCard";
import SessionContext from "../../contexts/sessionProvider";
import { Evaluation } from "../../types/types";

export const StudentOverview: React.FC<{ student: Student }> = ({
    student,
}) => {
    const { getSessionKey, setSessionKey } = useContext(SessionContext);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fetchEvals = async () => {
        if (getSessionKey !== undefined) {
            getSessionKey().then(async (sessionKey) => {
                if (sessionKey != "") {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/student/${student.student.student_id}/suggest`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `auth/osoc2 ${sessionKey}`,
                            },
                        }
                    )
                        .then((response) => response.json())
                        .catch((error) => console.log(error));
                    if (response !== undefined && response.success) {
                        if (setSessionKey) {
                            setSessionKey(response.sessionkey);
                        }
                        setEvaluations(response.data);
                    }
                }
            });
        }
    };

    useEffect(() => {
        //fetchEvals().then();
        console.log(evaluations);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <StudentCard student={student} display={Display.FULL} />
            <h1>Suggestions</h1>
            {student.evaluations[0].evaluation.map((evaluation) => {
                return (
                    <p key={evaluation.evaluation_id}>{evaluation.decision}</p>
                );
            })}
        </div>
    );
};
