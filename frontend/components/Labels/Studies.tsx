import React from "react";
import styles from "./Labels.module.scss"

/**
 * Maps a study to a color and better string representation
 */
const studyToStyle = new Map<string, [string, string]>()
studyToStyle.set("Backend development", ["Backend Development", styles.blue])
studyToStyle.set("Business management", ["Business Management", styles.green])
studyToStyle.set("Communication Sciences", ["Communication Sciences", styles.yellow])
studyToStyle.set("Computer Sciences", ["Computer Sciences", styles.red])
studyToStyle.set("Design", ["Design", styles.other])
studyToStyle.set("Frontend development", ["Frontend Development", styles.blue])
studyToStyle.set("Marketing", ["Marketing", styles.green])
studyToStyle.set("Photography", ["Photography", styles.yellow])
studyToStyle.set("Videography", ["Videography", styles.red])


const getStudyStyle = (study: string) => {
    if (studyToStyle.has(study)) {
        return studyToStyle.get(study)
    }

    return [study, styles.other]
}

/**
 * A label that is colored corresponding to the given study
 * @param role
 * @constructor
 */
export const Study: React.FC<{study: string}> = ({study}) => {
    const styleAndString = getStudyStyle(study)
    const betterStudy = styleAndString ? styleAndString[0] : study
    const style = styleAndString ? styleAndString[1] : styles.other
    return <div className={`${styles.label} ${style}`}>{betterStudy}</div>
}
