import React from "react";
import styles from "./Labels.module.scss"

/**
 * Maps a language to a color
 */
const studyToStyle = new Map<string, string>()
studyToStyle.set("Backend Development", styles.blue)
studyToStyle.set("Business Manager", styles.green)
studyToStyle.set("Communication Sciences", styles.yellow)
studyToStyle.set("Computer Sciences", styles.red)
studyToStyle.set("Design", styles.other)
studyToStyle.set("Frontend Development", styles.blue)
studyToStyle.set("Marketing", styles.green)
studyToStyle.set("Photography", styles.yellow)
studyToStyle.set("Marketing", styles.red)
studyToStyle.set("Photography", styles.yellow)
studyToStyle.set("Videography", styles.red)


const getStudyStyle = (role: string) => {
    if (studyToStyle.has(role)) {
        return studyToStyle.get(role)
    }

    return styles.other
}

/**
 * A label that is colored corresponding to the given study
 * @param role
 * @constructor
 */
export const Study: React.FC<{study: string}> = ({study}) => {
    return <div className={`${styles.label} ${getStudyStyle(study)}`}>{study}</div>
}
