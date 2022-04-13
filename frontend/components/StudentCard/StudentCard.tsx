import React from "react";
import {Decision, Student} from "../../types/types";
import styles from "./StudentCard.module.scss"
import {Role} from "../Labels/Roles";
import {Study} from "../Labels/Studies";
import {Diploma} from "../Labels/Diploma";
import Image from "next/image";
import GitHubLogo from "../../public/images/github-logo.svg";
import {useRouter} from "next/router";
import {LanguageAndSkill} from "../Labels/LanguageAndSkill";

export const StudentCard: React.FC<{ student: Student}> = ({student}) => {

    const router = useRouter()
    
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

    const clickStopper = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation();
    }

    

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const divClickHandler = (event: React.MouseEvent<HTMLDivElement>) => {
        router.push({
            pathname: `/student/${student.student.student_id}`,
        }).then();
    }

    return (
        <div className={styles.card} onClick={divClickHandler}>
            <div className={styles.body} style={{paddingBottom: `${totalAmount === 0 ? "0.5rem" : "2rem"}`}}>
                < h2> {`${student.student.person.firstname} ${student.student.person.lastname}`}</h2>
                <div className={styles.grid}>
                    <div className={styles.column}>
                        <h6 className={styles.categoryTitle}>LANGUAGES AND SKILLS</h6>
                        <div className={styles.category}>
                            {student.jobApplication.job_application_skill.map((language, index) => {
                                return <LanguageAndSkill key={index} language={language.skill}/>
                            })}
                        </div>
                        <h6 className={styles.categoryTitle}>ROLES</h6>
                        <div className={styles.category}>
                            {student.roles.map((role, index) => <Role key={index} role={role}/>)}
                        </div>

                    </div>
                    <div className={styles.column}>
                        <h6 className={styles.categoryTitle}>{"DIPLOMA'S"}</h6>
                        <div className={styles.category}>
                            {student.jobApplication.edu_level.map((diploma, index) => <Diploma key={index}
                                                                                               diploma={diploma}/>)}
                        </div>
                        <h6 className={styles.categoryTitle}>STUDIES</h6>
                        <div className={styles.category}>
                            {student.jobApplication.edus.map((study, index) => <Study key={index} study={study}/>)}
                        </div>
                    </div>
                    <div className={styles.column}>
                        <h6 className={styles.categoryTitle}>EMAIL</h6>
                        <a href={`mailto:${student.student.person.email}`} onClick={clickStopper}>{student.student.person.email}</a>
                        <h6 className={styles.categoryTitle}>PHONE NUMBER</h6>
                        <a href={`tel:${student.student.phone_number}`} onClick={clickStopper}>{student.student.phone_number}</a>
                        {student.student.person.github !== null ?
                            <a 
                            className={styles.githubContainer} 
                            href={`https://github.com/${student.student.person.github}`}
                            onClick={clickStopper}
                            >
                                <div className={styles.githublogo}>
                                    <Image
                                        src={GitHubLogo}
                                        layout="intrinsic"
                                        alt="GitHub Logo"
                                    />
                                </div>
                                <p className={styles.github}>{student.student.person.github}</p>
                            </a>
                            : null}
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
