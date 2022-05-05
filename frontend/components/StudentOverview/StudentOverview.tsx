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
import CheckIconColor from "../../public/images/green_check_mark_color.png";
import ExclamationIconColor from "../../public/images/exclamation_mark_color.png";
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png";
import Image from "next/image";

export const StudentOverview: React.FC<{
    student: Student;
    updateEvaluations?: (
        studentId: number,
        evalutations: EvaluationCoach[]
    ) => void;
    clearSelection?: () => void;
}> = ({ student, updateEvaluations, clearSelection }) => {
    const myRef = React.createRef<HTMLInputElement>();
    const { sessionKey, getSession } = useContext(SessionContext);
    const [evaluations, setEvaluations] = useState<EvaluationCoach[]>([]);
    // the counter is used to check if the evaluations data is updated because putting
    // the evaluations variable in the useEffect hook causes an infinite loop
    const [showSuggestionField, setShowSuggestionField] = useState(false);
    const [decision, setDecision] = useState<Decision>(Decision.YES);
    const [suggestBool, setSuggestBool] = useState(true);
    const [motivation, setMotivation] = useState("");

    const fetchEvals = async () => {
        if (getSession !== undefined) {
            getSession().then(async ({ sessionKey }) => {
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

    /**
     * Call the `updateEvalutations` callback when the evaluations change
     */
    useEffect(() => {
        if (updateEvaluations !== undefined) {
            updateEvaluations(student.student.student_id, evaluations);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [evaluations]);

    const makeSuggestion = async () => {
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
                setMotivation("");
                const evaluation = response as EvaluationCoach;
                // The creation was succesfull, we can update the evaluation bar
                if (evaluation !== undefined) {
                    fetchEvals().then();
                }
            }
        }
    };

    const makeDecision = async () => {
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
                setMotivation("");
            }
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
            makeSuggestion().then();
        } else {
            makeDecision().then();
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

    const decision_to_image = {
        [Decision.YES]: CheckIconColor,
        [Decision.MAYBE]: ExclamationIconColor,
        [Decision.NO]: ForbiddenIconColor,
    };

    const close = () => {
        if (clearSelection !== undefined) {
            clearSelection();
        }
    };

    return (
        <div>
            <Modal
                visible={showSuggestionField}
                handleClose={closer}
                title={"Please fill in you motivation (optional)"}
            >
                <div className={styles.modalContent}>
                    <input
                        ref={myRef}
                        type="text"
                        name="motivation"
                        className="input"
                        value={motivation}
                        placeholder="type your motivation..."
                        onKeyDown={(e) => handleEnterConfirm(e)}
                        onChange={(e) => setMotivation(e.target.value)}
                    />

                    <button onClick={handleConfirm}>CONFIRM</button>
                </div>
            </Modal>
            {clearSelection !== undefined ? (
                <div
                    className={`delete is-large ${styles.close}`}
                    onClick={close}
                />
            ) : null}
            <StudentCard student={student} display={Display.FULL} />

            <div className={styles.body}>
                <div className={styles.finaldecision}>
                    <h2>Status</h2>
                    <div className={styles.dropdown}>
                        <button className={styles.dropbtn}>Set Status</button>
                        <div className={styles.dropdownContent}>
                            <a onClick={() => enumDecision(Decision.YES)}>
                                YES
                            </a>
                            <a onClick={() => enumDecision(Decision.NO)}>NO</a>
                            <a onClick={() => enumDecision(Decision.MAYBE)}>
                                MAYBE
                            </a>
                        </div>
                    </div>
                </div>

                <div>
                    {evaluations.map((evaluation) => {
                        if (evaluation.isFinal) {
                            return (
                                <div
                                    className={styles.suggestion}
                                    key={evaluation.evaluation_id}
                                >
                                    <Image
                                        className={styles.buttonImage}
                                        src={
                                            decision_to_image[
                                                student.evaluation.evaluations.filter(
                                                    (evaluation) =>
                                                        evaluation.is_final
                                                )[0].decision
                                            ]
                                        }
                                        width={30}
                                        height={30}
                                        alt={"Final Decision"}
                                    />
                                    <p>
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
                <div className={styles.suggestionheader}>
                    <h2>Suggestions</h2>
                    <div className={styles.suggestionbuttons}>
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
                </div>

                {evaluations.map((evaluation) => {
                    if (!evaluation.isFinal) {
                        return (
                            <div
                                className={styles.suggestion}
                                key={evaluation.evaluation_id}
                            >
                                <Image
                                    className={styles.buttonImage}
                                    src={
                                        decision_to_image[
                                            evaluation.decision as Decision
                                        ]
                                    }
                                    width={30}
                                    height={30}
                                    alt={"Suggestion"}
                                />

                                <strong>
                                    {evaluation.senderFirstname}{" "}
                                    {evaluation.senderLastname}:
                                </strong>
                                {evaluation.reason}
                            </div>
                        );
                    }
                })}
                <h2>Job Application</h2>
                <div className={styles.jobapplication}>
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
            </div>
        </div>
    );
};
