import React from "react";
import { Project } from "../../types";
import styles from "./ProjectCard.module.css";

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    return (
        <div className={styles.card}>
            <h2>{project.name}</h2>
        </div>
    );
};
