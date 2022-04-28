import {
    Display,
    Student,
    EvaluationCoach,
    Decision,
    AttachmentType,
    Attachment,
} from "../../types";
import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import { StudentCard } from "../StudentCard/StudentCard";
import SessionContext from "../../contexts/sessionProvider";
import styles from "./StudentOverview.module.scss";
import { Modal } from "../Modal/Modal";

export const StudentOverview: React.FC<{
    student: Student;
    updateEvaluation: (studentId: number, evalutation: EvaluationCoach) => void;
}> = ({ student, updateEvaluation }) => {
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

                        // TODO the backend should return the evaluation upon success
                        const evaluation = response.data as EvaluationCoach;
                        updateEvaluation(
                            student.student.student_id,
                            evaluation
                        );
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

    const getAttachmentType = (type: AttachmentType) => {
        if (type[0] === AttachmentType.CV_URL) {
            return "Curriculum";
        } else if (
            type[0] === AttachmentType.MOTIVATION_STRING ||
            type[0] === AttachmentType.MOTIVATION_URL
        ) {
            return "Motivation";
        } else if (type[0] === AttachmentType.PORTFOLIO_URL) {
            return "Portfolio";
        } else if (type[0] === AttachmentType.FILE_URL) {
            return "Further Attachments";
        }
    };

    const compareAttachments = (a1: Attachment, a2: Attachment) => {
        if (
            a1.type[0][0] === AttachmentType.MOTIVATION_STRING ||
            a1.type[0][0] === AttachmentType.MOTIVATION_URL
        ) {
            return 1;
        }
        if (
            a2.type[0][0] === AttachmentType.MOTIVATION_STRING ||
            a2.type[0][0] === AttachmentType.MOTIVATION_URL
        ) {
            return -1;
        }
        if (a1.type[0][0] === AttachmentType.CV_URL) {
            return 1;
        }
        if (a2.type[0][0] === AttachmentType.CV_URL) {
            return -1;
        }
        if (a1.type[0][0] === AttachmentType.PORTFOLIO_URL) {
            return 1;
        }
        if (a2.type[0][0] === AttachmentType.PORTFOLIO_URL) {
            return -1;
        }
        return 0;
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
                <h2>Suggestions</h2>
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
            <h2>JobApplication</h2>
            {student.jobApplication.attachment
                .sort(compareAttachments)
                .map((attachment) => (
                    <div key={attachment.attachment_id}>
                        <h1>{getAttachmentType(attachment.type)}</h1>
                        {attachment.type[0] ===
                        AttachmentType.MOTIVATION_STRING ? (
                            <p>{attachment.data}</p>
                        ) : (
                            <a>{attachment.data}</a>
                        )}
                    </div>
                ))}
            <h1>Fun fact</h1>
            <p>{student.jobApplication.fun_fact}</p>
            <h1>Responsabilities</h1>
            <p>{student.jobApplication.responsibilities}</p>
            <h1>Volunteer</h1>
            <p>{student.jobApplication.student_volunteer_info}</p>
        </div>
    );
};
