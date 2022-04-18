import React from "react";
import styles from "./Labels.module.scss";

/**
 * Maps a role to a color and a better string representation
 */
const roleToStyle = new Map<string, [string, string]>();
roleToStyle.set("Back-end developer", ["Backend Developer", styles.blue]);
roleToStyle.set("Business Modeller", ["Business Modeller", styles.green]);
roleToStyle.set("Storyteller", ["Storyteller", styles.yellow]);
roleToStyle.set("UX / UI designer", ["UX / UI Designer", styles.red]);
roleToStyle.set("Graphic designer", ["Graphic Designer", styles.other]);
roleToStyle.set("Front-end developer", ["Frontend Developer", styles.blue]);
roleToStyle.set("Marketer", ["Marketer", styles.green]);
roleToStyle.set("Photographer", ["Photographer", styles.yellow]);
roleToStyle.set("Video editor", ["Video Editor", styles.red]);
roleToStyle.set("Copywriter", ["Copywriter", styles.yellow]);

const getRoleStyle = (role: string) => {
    if (roleToStyle.has(role)) {
        return roleToStyle.get(role);
    }

    return [role, styles.other];
};

/**
 * A label that is colored corresponding to the given role
 * @param role
 * @constructor
 */
export const Role: React.FC<{ role: string }> = ({ role }) => {
    const styleAndString = getRoleStyle(role);
    const betterRole = styleAndString ? styleAndString[0] : role;
    const style = styleAndString ? styleAndString[1] : styles.other;
    return <div className={`${styles.label} ${style}`}>{betterRole}</div>;
};
