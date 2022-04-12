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




const getDiplomaStyle = (language: string) => {
    if (diplomaToStyle.has(language)) {
        return diplomaToStyle.get(language)
    }

    return styles.other
}

/**
 * A label that is colored corresponding to the given diploma
 * @param language
 * @constructor
 */
export const Diploma: React.FC<{diploma: string}> = ({diploma}) => {
    const response = getDiplomaStyle(diploma)
    const styleAndString = response ? response : [diploma, styles.other]
    const betterDipl = styleAndString[0]
    const style = styleAndString[1]
    return <div className={`${styles.label} ${style}`}>{betterDipl}</div>
}
