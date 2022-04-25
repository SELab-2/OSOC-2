import { Display, Student, EvaluationCoach } from "../../types";
import React, { useContext, useEffect, useState } from "react";
import { StudentCard } from "../StudentCard/StudentCard";
import SessionContext from "../../contexts/sessionProvider";

export const StudentOverview: React.FC<{ student: Student }> = ({
    student,
}) => {
    const { getSessionKey } = useContext(SessionContext);
    const [evaluations, setEvaluations] = useState<EvaluationCoach[]>([]);

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
                        setEvaluations(response.data);
                    }
                }
            });
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const buttonHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (getSessionKey !== undefined) {
            getSessionKey().then(async (sessionKey) => {
                if (sessionKey != "") {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/student/${student.student.student_id}/suggest`,
                        {
                            method: "POST",
                            headers: {
                                Authorization: `auth/osoc2 ${sessionKey}`,
                                "Content-Type": "application/json",
                                Accept: "application/json",
                            },
                            body: JSON.stringify({
                                id: student.student.student_id,
                                suggestion: "NO",
                                senderId: 3,
                            }),
                        }
                    )
                        .then((response) => response.json())
                        .catch((error) => console.log(error));
                }
            });
        }
    };

    useEffect(() => {
        fetchEvals().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <StudentCard student={student} display={Display.FULL} />
            <h1>Suggestions</h1>
            <button onClick={buttonHandler}>Suggest yes</button>
            {evaluations.map((evaluation) => {
                return (
                    <div key={evaluation.evaluation_id}>
                        <p>
                            {evaluation.decision}{" "}
                            <strong>
                                {evaluation.senderFirstname}{" "}
                                {evaluation.senderLastname}
                                {": "}
                            </strong>
                            {evaluation.reason}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};
