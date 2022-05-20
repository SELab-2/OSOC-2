import React from "react";
import { Decision, Display, Student } from "../../types";
import styles from "./StudentCard.module.scss";
import { Diploma } from "../Labels/Diploma";
import Image from "next/image";
import GitHubLogo from "../../public/images/github-logo.svg";
import { Label } from "../Labels/Label";
import CheckIconColor from "../../public/images/green_check_mark_color.png";
import ExclamationIconColor from "../../public/images/exclamation_mark_color.png";
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png";
import {useDrag} from "react-dnd";

export const StudentCard: React.FC<{ student: Student; display: Display }> = ({
    student,
    display,
}) => {
    const decision_to_image = {
        [Decision.YES]: CheckIconColor,
        [Decision.MAYBE]: ExclamationIconColor,
        [Decision.NO]: ForbiddenIconColor,
    };

    const [{ isDragging }, drag] = useDrag(() => ({
        // "type" is required. It is used by the "accept" specification of drop targets.
        type: 'Student',
        item: student,
        // The collect function utilizes a "monitor" instance (see the Overview for what this is)
        // to pull important pieces of state from the DnD system.
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }))

    return (
        <div className={styles.body} ref={drag}>
            <header>
                <div>
                    <h2>{student.student.person.name}</h2>
                    <h1>{student.evaluation.osoc.year}</h1>
                </div>
                {student.evaluation.evaluations.map((evaluation) => {
                    if (evaluation.is_final) {
                        return (
                            <Image
                                key={evaluation.evaluation_id}
                                className={styles.buttonImage}
                                src={decision_to_image[evaluation.decision]}
                                width={30}
                                height={30}
                                alt={"Final Decision"}
                            />
                        );
                    }
                })}
            </header>

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
                                    <Label key={index} label={language.skill} />
                                );
                            }
                        )}
                    </div>
                    <h6 className={styles.categoryTitle}>ROLES</h6>
                    <div className={styles.category}>
                        {student.roles.map((role, index) => (
                            <Label key={index} label={role} />
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
                                <Label key={index} label={study} />
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
