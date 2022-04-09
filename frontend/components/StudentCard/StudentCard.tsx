import React from "react";
import {Student} from "../../types/types";
import styles from "./StudentCard.module.scss"
import {Language} from "../Labels/Language";
import {Role} from "../Labels/Roles";
import {Study} from "../Labels/Studies";

export const StudentCard: React.FC<{ student: Student }> = ({student}) => {
    console.log(student)
    return (
        <div className={styles.card}>
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
    )
}
