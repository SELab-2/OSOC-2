import React from "react";
import styles from "./Labels.module.scss"

// Maps a number to a color
const colors = [styles.blue, styles.green, styles.yellow, styles.red, styles.other]

/**
 * We set the label color using the sum of character codes module the amount of available colors
 * This way every label that has the same value has the same coloring
 * @param label
 */
const getLabelColor = (label: string) => {
    let color = 0
    for (let i = 0; i < label.length; i++) {
        color += label.charCodeAt(i) % colors.length
    }
    color %= colors.length

    return colors[color]
}


// Maps a skill to a color
const languageToStyle = new Map<string, string>()
languageToStyle.set("Dutch", styles.blue)
languageToStyle.set("English", styles.green)
languageToStyle.set("French", styles.yellow)
languageToStyle.set("German", styles.red)


const getLanguageStyle = (language: string) => {
    if (languageToStyle.has(language)) {
        return languageToStyle.get(language)
    }

    return getLabelColor(language)
}

/**
 * A label that is colored corresponding to the given language
 * @param language
 * @constructor
 */
export const LanguageAndSkill: React.FC<{language: string}> = ({language}) => {
    return <div className={`${styles.label} ${getLanguageStyle(language)}`}>{language}</div>
}
