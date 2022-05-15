import {
    Display,
    Student,
    Decision,
    AttachmentType,
    Attachment,
    Evaluation,
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
    updateEvaluations?: (studentId: number, evalutations: Evaluation[]) => void;
    clearSelection?: () => void;
}> = ({ student, updateEvaluations, clearSelection }) => {
    const myRef = React.createRef<HTMLInputElement>();
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [showSuggestionField, setShowSuggestionField] = useState(false);
    const [decision, setDecision] = useState<Decision>(Decision.YES);
    const [suggestBool, setSuggestBool] = useState(true);
    const [motivation, setMotivation] = useState("");
    const { getSession } = useContext(SessionContext);

    const fetchEvals = async () => {
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
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
            console.log(response);
            setEvaluations(response.evaluation.evaluations);
        }
    };

    useEffect(() => {
        setEvaluations([]);
        fetchEvals().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [student]);

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
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
            // The creation was succesfull, we can update the evaluation bar
            fetchEvals().then();
        }
    };

    const makeDecision = async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
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
            // The creation was succesfull, we can update the evaluation bar
            fetchEvals().then();
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
                title={"Please fill in your motivation (optional)"}
            >
                <div className={styles.modalContent}>
                    <input
                        data-testid={"motivationInput"}
                        ref={myRef}
                        type="text"
                        name="motivation"
                        className="input"
                        value={motivation}
                        placeholder="type your motivation..."
                        onKeyDown={(e) => handleEnterConfirm(e)}
                        onChange={(e) => setMotivation(e.target.value)}
                    />

                    <button
                        data-testid={"motivationConfirm"}
                        onClick={handleConfirm}
                    >
                        CONFIRM
                    </button>
                </div>
            </Modal>
            {clearSelection !== undefined ? (
                <div
                    className={`delete is-large ${styles.close}`}
                    onClick={close}
                />
            ) : null}
            <div className={styles.studentCard}>
                <StudentCard student={student} display={Display.FULL} />
            </div>

            <div className={styles.body}>
                <div className={styles.finaldecision}>
                    <h2>Status</h2>
                    <div className={styles.dropdown}>
                        <button className={styles.dropbtn}>Set Status</button>
                        <div className={styles.dropdownContent}>
                            <a
                                data-testid={"permanentYes"}
                                onClick={() => enumDecision(Decision.YES)}
                            >
                                YES
                            </a>
                            <a
                                data-testid={"permanentNo"}
                                onClick={() => enumDecision(Decision.NO)}
                            >
                                NO
                            </a>
                            <a
                                data-testid={"permanentMaybe"}
                                onClick={() => enumDecision(Decision.MAYBE)}
                            >
                                MAYBE
                            </a>
                        </div>
                    </div>
                </div>

                <div>
                    {evaluations.map((evaluation) => {
                        if (evaluation.is_final) {
                            return (
                                <div
                                    data-testid={"finalEvaluation"}
                                    className={styles.suggestion}
                                    key={evaluation.evaluation_id}
                                >
                                    <Image
                                        className={styles.buttonImage}
                                        src={
                                            decision_to_image[
                                                evaluation.decision
                                            ]
                                        }
                                        width={30}
                                        height={30}
                                        alt={"Final Decision"}
                                    />
                                    <p>
                                        <strong>
                                            {
                                                evaluation.login_user
                                                    .person_data.name
                                            }
                                            {": "}
                                        </strong>
                                        {evaluation.motivation}
                                    </p>
                                </div>
                            );
                        }
                    })}
                </div>
                <div className={styles.suggestionheader}>
                    <h2>Suggestions</h2>
                    <div className={styles.suggestionbuttons}>
                        <button
                            data-testid={"suggestYes"}
                            onClick={() => enumSuggest(Decision.YES)}
                        >
                            Suggest yes
                        </button>
                        <button
                            data-testid={"suggestMaybe"}
                            onClick={() => enumSuggest(Decision.MAYBE)}
                        >
                            Suggest maybe
                        </button>
                        <button
                            data-testid={"suggestNo"}
                            onClick={() => enumSuggest(Decision.NO)}
                        >
                            Suggest no
                        </button>
                    </div>
                </div>
                {evaluations.map((evaluation) => {
                    if (!evaluation.is_final) {
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
                                    {evaluation.login_user.person_data.name}:
                                </strong>
                                {evaluation.motivation}
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
                                <h1>{getAttachmentType(attachment.type[0])}</h1>
                                {attachment.data.map((data, index) => {
                                    if (
                                        attachment.type[index] ===
                                        AttachmentType.MOTIVATION_STRING
                                    ) {
                                        return <p key={index}>{data}</p>;
                                    }
                                    return (
                                        <a key={index} href={data}>
                                            {data}
                                        </a>
                                    );
                                })}
                            </div>
                        ))}
                    <div>
                        <h1>Fun fact</h1>
                        <p>{student.jobApplication.fun_fact}</p>
                    </div>
                    <div>
                        <h1>Responsabilities</h1>
                        <p>{student.jobApplication.responsibilities}</p>
                    </div>
                    <div>
                        <h1>Volunteer</h1>
                        <p>{student.jobApplication.student_volunteer_info}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
