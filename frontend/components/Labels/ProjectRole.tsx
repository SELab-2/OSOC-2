import React from "react";
import styles from "./Labels.module.scss";

// Maps a number to a color
const colors = [
    styles.blue,
    styles.green,
    styles.yellow,
    styles.red,
    styles.other,
];

/**
 * We set the label color using the sum of character codes module the amount of available colors
 * This way every label that has the same value has the same coloring
 * @param label
 */
const getLabelColor = (label: string) => {
    let color = 0;
    for (let i = 0; i < label.length; i++) {
        color += label.charCodeAt(i) % colors.length;
    }
    color %= colors.length;

    return colors[color];
};

/**
 * A label that is colored corresponding to the given input
 * used in project assigned roles
 * @param label
 * @param posisions Amount of filled positions of form X/Y
 * @constructor
 */
export const ProjectRole: React.FC<{ label: string; positions: string }> = ({
    label,
    positions,
}) => {
    return (
        <div className={`${styles.label} ${getLabelColor(label)}`}>
            <strong>{positions}</strong> {label}
        </div>
    );
};
