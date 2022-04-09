import React from "react";
import styles from "./Labels.module.scss"

/**
 * Maps a language to a color
 */
const languageToStyle = new Map<string, string>()
languageToStyle.set("Dutch", styles.blue)
languageToStyle.set("English", styles.green)
languageToStyle.set("French", styles.yellow)
languageToStyle.set("German", styles.red)


const getLanguageStyle = (language: string) => {
    if (languageToStyle.has(language)) {
        return languageToStyle.get(language)
    }

    return styles.other
}

/**
 * A label that is colored corresponding to the given language
 * @param language
 * @constructor
 */
export const Language: React.FC<{language: string}> = ({language}) => {
    return <div className={`${styles.label} ${getLanguageStyle(language)}`}>{language}</div>
}
