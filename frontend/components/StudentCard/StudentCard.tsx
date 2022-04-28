import React from "react";
import { Display, Student } from "../../types";
import styles from "./StudentCard.module.scss";
import { Role } from "../Labels/Roles";
import { Study } from "../Labels/Studies";
import { Diploma } from "../Labels/Diploma";
import Image from "next/image";
import GitHubLogo from "../../public/images/github-logo.svg";
import { LanguageAndSkill } from "../Labels/LanguageAndSkill";

export const StudentCard: React.FC<{ student: Student; display: Display }> = ({
    student,
    display,
}) => {
    return (
        <div className={styles.body}>
            <h2>
                {" "}
                {`${student.student.person.firstname} ${student.student.person.lastname}`}
            </h2>
            <div
                className={`${
                    display === Display.FULL ? styles.grid : styles.limited
                }`}
            >
                <div className={styles.column}>
                    <h6 className={styles.categoryTitle}>
                        SKILLS AND LANGUAGES
                    </h6>
                    <div className={styles.category}>
                        {student.jobApplication.job_application_skill.map(
                            (language, index) => {
                                return (
                                    <LanguageAndSkill
                                        key={index}
                                        language={language.skill}
                                    />
                                );
                            }
                        )}
                    </div>
                    <h6 className={styles.categoryTitle}>ROLES</h6>
                    <div className={styles.category}>
                        {student.roles.map((role, index) => (
                            <Role key={index} role={role} />
                        ))}
                    </div>
                </div>
                {display !== Display.LIMITED ? (
                    <div className={styles.column}>
                        <h6 className={styles.categoryTitle}>{"DIPLOMA"}</h6>
                        <div className={styles.category}>
                            <Diploma
                                diploma={student.jobApplication.edu_level}
                                edu_duration={
                                    student.jobApplication.edu_duration
                                }
                                edu_year={student.jobApplication.edu_year}
                            />
                        </div>
                        <h6 className={styles.categoryTitle}>STUDIES</h6>
                        <div className={styles.category}>
                            {student.jobApplication.edus.map((study, index) => (
                                <Study key={index} study={study} />
                            ))}
                        </div>
                    </div>
                ) : null}
                {display !== Display.LIMITED ? (
                    <div className={styles.column}>
                        <h6 className={styles.categoryTitle}>EMAIL</h6>
                        <a href={`mailto:${student.student.person.email}`}>
                            {student.student.person.email}
                        </a>
                        <h6 className={styles.categoryTitle}>PHONE NUMBER</h6>
                        <a href={`tel:${student.student.phone_number}`}>
                            {student.student.phone_number}
                        </a>
                        {student.student.person.github !== null ? (
                            <a
                                className={styles.githubContainer}
                                href={`https://github.com/${student.student.person.github}`}
                            >
                                <div className={styles.githublogo}>
                                    <Image
                                        src={GitHubLogo}
                                        layout="intrinsic"
                                        alt="GitHub Logo"
                                    />
                                </div>
                                <p className={styles.github}>
                                    {student.student.person.github}
                                </p>
                            </a>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
};
