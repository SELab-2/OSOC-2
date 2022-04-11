import React from "react";
import styles from "./Labels.module.scss"

/**
 * Maps a language to a color
 */
const roleToStyle = new Map<string, string>()
roleToStyle.set("Backend Developer", styles.blue)
roleToStyle.set("Business Modeller", styles.green)
roleToStyle.set("Storyteller", styles.yellow)
roleToStyle.set("UX / UI Designer", styles.red)
roleToStyle.set("Graphic Designer", styles.other)
roleToStyle.set("Frontend Developer", styles.blue)
roleToStyle.set("Marketer", styles.green)
roleToStyle.set("Photographer", styles.yellow)
roleToStyle.set("Video Editor", styles.red)
roleToStyle.set("Copywriter", styles.yellow)


const getRoleStyle = (role: string) => {
    if (roleToStyle.has(role)) {
        return roleToStyle.get(role)
    }

    return styles.other
}

/**
 * A label that is colored corresponding to the given role
 * @param role
 * @constructor
 */
export const Role: React.FC<{role: string}> = ({role}) => {
    return <div className={`${styles.label} ${getRoleStyle(role)}`}>{role}</div>
}
