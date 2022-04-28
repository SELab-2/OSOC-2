import { Display, Student, EvaluationCoach, Decision } from "../../types";
import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import { StudentCard } from "../StudentCard/StudentCard";
import SessionContext from "../../contexts/sessionProvider";
import styles from "./StudentOverview.module.scss";
import { Modal } from "../../components/Modal/Modal";

export const StudentOverview: React.FC<{ student: Student }> = ({
    student,
}) => {
    const myRef = React.createRef<HTMLInputElement>();
    const { getSessionKey } = useContext(SessionContext);
    const [evaluations, setEvaluations] = useState<EvaluationCoach[]>([]);
    const [counter, setCounter] = useState(0);
    // the counter is used to check if the evaluations data is updated because putting
    // the evaluations variable in the useEffect hook causes an infinite loop
    const [showSuggestionField, setShowSuggestionField] = useState(false);
    const [decision, setDecision] = useState<Decision>(Decision.YES);
    const [suggestBool, setSuggestBool] = useState(true);
    const [motivation, setMotivation] = useState("");

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
    }, [counter]);

    const makeSuggestion = () => {
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
                                suggestion: decision,
                                reason: motivation,
                            }),
                        }
                    )
                        .then((response) => response.json())
                        .catch((error) => console.log(error));
                    if (response !== undefined && response.success) {
                        setCounter(counter + 1);
                        setMotivation("");
                    }
                }
            });
        }
    };

    const makeDecision = () => {
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
                                reply: decision,
                                reason: motivation,
                            }),
                        }
                    )
                        .then((response) => response.json())
                        .catch((error) => console.log(error));
                    if (response !== undefined && response.success) {
                        setCounter(counter + 1);
                        setMotivation("");
                    }
                }
            });
        }
    };

    const enumSuggest = (dec: Decision) => {
        setShowSuggestionField(true);
        setDecision(dec);
        setSuggestBool(true);
        if (myRef.current !== null) {
            myRef.current.focus();
        }
    };

    const enumDecision = (dec: Decision) => {
        setShowSuggestionField(true);
        setDecision(dec);
        setSuggestBool(false);
    };

    const handleConfirm = () => {
        setShowSuggestionField(false);
        if (suggestBool) {
            makeSuggestion();
        } else {
            makeDecision();
        }
    };

    const handleEnterConfirm = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleConfirm();
        }
    };

    const closer = (e: SyntheticEvent) => {
        e.preventDefault();
        setShowSuggestionField(false);
    };

    return (
        <div>
            <Modal
                visible={showSuggestionField}
                handleClose={closer}
                title={"Please fill in you motivation (optional)"}
            >
                <input
                    ref={myRef}
                    id="motivationField"
                    type="text"
                    name="motivation"
                    value={motivation}
                    placeholder="type your motivation..."
                    onKeyDown={(e) => handleEnterConfirm(e)}
                    onChange={(e) => setMotivation(e.target.value)}
                />

                <button onClick={handleConfirm}>CONFIRM</button>
            </Modal>
            <StudentCard student={student} display={Display.FULL} />
            <div className={styles.dropdown}>
                <button className={styles.dropbtn}>Set status</button>
                <div className={styles.dropdown_content}>
                    <a onClick={() => enumDecision(Decision.YES)}>YES</a>
                    <a onClick={() => enumDecision(Decision.NO)}>NO</a>
                    <a onClick={() => enumDecision(Decision.MAYBE)}>MAYBE</a>
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
                <button onClick={() => enumSuggest(Decision.YES)}>
                    Suggest yes
                </button>
                <button onClick={() => enumSuggest(Decision.MAYBE)}>
                    Suggest maybe
                </button>
                <button onClick={() => enumSuggest(Decision.NO)}>
                    Suggest no
                </button>
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
            <h1>JobApplication</h1>
            {student.jobApplication.attachment.map((attachement) => {
                return (
                    <div key={attachement.attachment_id}>
                        <p>{attachement.type}</p>
                        <p>{attachement.data}</p>
                    </div>
                );
            })}
        </div>
    );
};
