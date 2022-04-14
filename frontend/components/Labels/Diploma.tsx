import React from "react";
import styles from "./Labels.module.scss"

/**
 * Maps a Diploma to a color and better string representation
 */
const diplomaToStyle = new Map<string, [string, string]>()
diplomaToStyle.set("A professional Bachelor", ["Professional Bachelor", styles.blue])
diplomaToStyle.set("An academic Bachelor", ["Academic Bachelor", styles.green])
diplomaToStyle.set("An associate degree", ["Associate Degree", styles.yellow])
diplomaToStyle.set("A master's degree", ["Master's Degree", styles.red])
diplomaToStyle.set("Doctoral degree", ["Doctoral Degree", styles.other])
diplomaToStyle.set("No diploma, I am self taught", ["Self Taught", styles.other])


const getDiplomaStyle = (diploma: string) => {
    if (diplomaToStyle.has(diploma)) {
        return diplomaToStyle.get(diploma)
    }

    return [diploma, styles.other]
}

/**
 * A label that is colored corresponding to the given diploma
 * @param language
 * @constructor
 */
export const Diploma: React.FC<{ diploma: string, edu_duration: string, edu_year: string }> = ({
                                                                                                   diploma,
                                                                                                   edu_duration,
                                                                                                   edu_year
                                                                                               }) => {
    const styleAndString = getDiplomaStyle(diploma)
    const betterDipl = styleAndString ? styleAndString[0] : diploma
    const style = styleAndString ? styleAndString[1] : styles.other
    return <div
        className={`${styles.label} ${style}`}>{`${betterDipl}${edu_duration !== undefined && edu_year !== undefined ?
        `  (${edu_year} / ${edu_duration}yr.)` : ""}`}</div>
}
