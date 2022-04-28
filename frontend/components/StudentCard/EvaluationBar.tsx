import { Decision, Evaluation } from "../../types";
import React from "react";
import styles from "./EvaluationBar.module.scss";

export const EvaluationBar: React.FC<{ evaluations: Evaluation[] }> = ({
    evaluations,
}) => {
    // Count evaluations
    let yesAmount = 0;
    let maybeAmount = 0;
    let noAmount = 0;
    for (const evaluation of evaluations) {
        if (!evaluation.is_final) {
            if (evaluation.decision === Decision.YES) {
                yesAmount++;
            } else if (evaluation.decision === Decision.MAYBE) {
                maybeAmount++;
            } else if (evaluation.decision === Decision.NO) {
                noAmount++;
            }
        }
    }
    const totalAmount = yesAmount + maybeAmount + noAmount;

    // We build the dynamic styles here
    const noStyle = {
        width: `${(noAmount * 100) / totalAmount}%`,
        borderBottomRightRadius: "0",
    };
    // Both corners should be rounded
    if (maybeAmount === 0 && yesAmount === 0) {
        noStyle.borderBottomRightRadius = "0.5rem";
    }
    const maybeStyle = {
        width: `${(maybeAmount * 100) / totalAmount}%`,
        borderBottomRightRadius: "0",
        borderBottomLeftRadius: "0",
    };
    // Left corner should be rounded
    if (noAmount === 0) {
        maybeStyle.borderBottomLeftRadius = "0.5rem";
    }
    // Right corner should be rounded
    if (yesAmount === 0) {
        maybeStyle.borderBottomRightRadius = "0.5rem";
    }

    const yesStyle = {
        width: `${(yesAmount * 100) / totalAmount}%`,
        borderBottomLeftRadius: "0",
    };
    // Both corners should be rounded
    if (noAmount === 0 && maybeAmount === 0) {
        yesStyle.borderBottomLeftRadius = "0.5rem";
    }
    return (
        <div className={styles.progressbar}>
            <div style={noStyle} className={styles.no}>
                <p className={noAmount === 0 ? styles.none : ""}>{noAmount}</p>
            </div>
            <div style={maybeStyle} className={styles.maybe}>
                <p className={maybeAmount === 0 ? styles.none : ""}>
                    {maybeAmount}
                </p>
            </div>
            <div style={yesStyle} className={styles.yes}>
                <p className={yesAmount === 0 ? styles.none : ""}>
                    {yesAmount}
                </p>
            </div>
        </div>
    );
};
