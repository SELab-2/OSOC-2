import React from "react";
import {Decision, Student} from "../../types/types";
import styles from "./StudentCard.module.scss"
import {Language} from "../Labels/Language";
import {Role} from "../Labels/Roles";
import {Study} from "../Labels/Studies";

export const StudentCard: React.FC<{ student: Student }> = ({student}) => {
    console.log(student)

    // Count evaluations
    const evaluations = student.evaluations[0].evaluation
    let yesAmount = 0
    let maybeAmount = 0
    let noAmount = 0
    for (const evaluation of evaluations) {
        if (evaluation.decision === Decision.YES) {
            yesAmount++
        } else if (evaluation.decision === Decision.MAYBE) {
            maybeAmount++
        } else if (evaluation.decision === Decision.NO) {
            noAmount++
        }
    }
    const totalAmount = yesAmount + maybeAmount + noAmount

    // We build the dynamic styles here
    const noStyle = {width: `${noAmount * 100 / totalAmount}%`, borderBottomRightRadius: "0"}
    // Both corners should be rounded
    if (maybeAmount === 0 && yesAmount === 0) {
        noStyle.borderBottomRightRadius = "0.5rem"
    }
    const maybeStyle = {
        width: `${maybeAmount * 100 / totalAmount}%`, borderBottomRightRadius: "0",
        borderBottomLeftRadius: "0"
    }
    // Left corner should be rounded
    if (noAmount === 0) {
        maybeStyle.borderBottomLeftRadius = "0.5rem"
    }
    // Right corner should be rounded
    if (yesAmount === 0) {
        maybeStyle.borderBottomRightRadius = "0.5rem"
    }

    const yesStyle = {width: `${yesAmount * 100 / totalAmount}%`, borderBottomLeftRadius: "0"}
    // Both corners should be rounded
    if (noAmount === 0 && maybeAmount === 0) {
        yesStyle.borderBottomLeftRadius = "0.5rem"
    }

    return (
        <div className={styles.card}>
            <div className={styles.body}>
                <h2>{`${student.student.person.firstname} ${student.student.person.lastname}`}</h2>
                <div className={styles.grid}>
                    <div className={styles.column}>
                        <h6 className={styles.categoryTitle}>LANGUAGES</h6>
                        <div className={styles.category}>
                            {student.languages.map(((language, index) => <Language key={index} language={language}/>))}
                        </div>
                        <h6 className={styles.categoryTitle}>STUDIES</h6>
                        <div className={styles.category}>
                            {student.jobApplication.edus.map((study, index) => <Study key={index} study={study}/>)}
                        </div>
                    </div>
                    <div className={styles.column}>
                        <h6 className={styles.categoryTitle}>SKILLS</h6>
                        <div className={styles.category}>
                            {student.jobApplication.job_application_skill.map((skill, index) => <p
                                key={index}>{skill.skill}</p>)}
                        </div>
                        <h6 className={styles.categoryTitle}>ROLES</h6>
                        <div className={styles.category}>
                            {student.roles.map((role, index) => <Role key={index} role={role}/>)}
                        </div>
                    </div>
                    <div className={styles.column}>
                        <h6 className={styles.categoryTitle}>EMAIL</h6>
                        <a href={`mailto:${student.student.person.email}`}>{student.student.person.email}</a>
                        <h6 className={styles.categoryTitle}>PHONE NUMBER</h6>
                        <a href={`tel:${student.student.phone_number}`}>{student.student.phone_number}</a>
                    </div>
                </div>
            </div>
            <div className={styles.progressbar}>
                <div style={noStyle} className={styles.no}>
                    <p className={noAmount === 0 ? styles.none : ""}>{noAmount}</p>
                </div>
                <div style={maybeStyle} className={styles.maybe}>
                    <p className={maybeAmount === 0 ? styles.none : ""}>{maybeAmount}</p>
                </div>
                <div style={yesStyle} className={styles.yes}>
                    <p className={yesAmount === 0 ? styles.none : ""}>{yesAmount}</p>
                </div>
            </div>
        </div>
    )
}
