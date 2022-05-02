import React from "react";
import { Project } from "../../types";
import styles from "./ProjectCard.module.css";

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    console.log(project);
    return <div className={styles.card}>TEST</div>;
};
