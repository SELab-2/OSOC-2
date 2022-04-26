import { Display, Student, EvaluationCoach } from "../../types";
import React, { useContext, useEffect, useState } from "react";
import { StudentCard } from "../StudentCard/StudentCard";
import SessionContext from "../../contexts/sessionProvider";
import styles from "./StudentOverview.module.scss";

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

    useEffect(() => {
        fetchEvals().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const yesSuggest = () => {
        makeSuggestion("YES");
    };

    const maybeSuggest = () => {
        makeSuggestion("MAYBE");
    };

    const noSuggest = () => {
        makeSuggestion("NO");
    };

    const definitiveYes = () => {
        makeDecision("YES");
    };

    const definitiveNo = () => {
        makeDecision("NO");
    };

    const definitiveMaybe = () => {
        makeDecision("MAYBE");
    };

    const makeSuggestion = (suggestion: string) => {
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
                                suggestion: suggestion,
                            }),
                        }
                    )
                        .then((response) => response.json())
                        .catch((error) => console.log(error));
                }
            });
        }
    };

    const makeDecision = (reply: string) => {
        if (getSessionKey !== undefined) {
            getSessionKey().then(async (sessionKey) => {
                if (sessionKey != "") {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/student/${student.student.student_id}/confirm`,
                        {
                            method: "POST",
                            headers: {
                                Authorization: `auth/osoc2 ${sessionKey}`,
                                "Content-Type": "application/json",
                                Accept: "application/json",
                            },
                            body: JSON.stringify({
                                id: student.student.student_id,
                                reply: reply,
                            }),
                        }
                    )
                        .then((response) => response.json())
                        .catch((error) => console.log(error));
                }
            });
        }
    };

    return (
        <div>
            <StudentCard student={student} display={Display.FULL} />
            <div className={styles.dropdown}>
                <button className={styles.dropbtn}>Set status</button>
                <div className={styles.dropdown_content}>
                    <a onClick={definitiveYes}>YES</a>
                    <a onClick={definitiveNo}>NO</a>
                    <a onClick={definitiveMaybe}>MAYBE</a>
                </div>
            </div>
            <div>
                {evaluations.map((evaluation) => {
                    if (evaluation.isFinal) {
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
                    }
                })}
            </div>
            <div>
                <h1>Suggestions</h1>
                <button onClick={yesSuggest}>Suggest yes</button>
                <button onClick={maybeSuggest}>Suggest maybe</button>
                <button onClick={noSuggest}>Suggest no</button>
            </div>
            {evaluations.map((evaluation) => {
                if (!evaluation.isFinal) {
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
                }
            })}
        </div>
    );
};
