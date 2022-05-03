import React from "react";
import { Project } from "../../types";
import styles from "./ProjectCard.module.css";

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    return (
        <div className={styles.card}>
            <h2>{project.name}</h2>
            <p>{project.partner}</p>
            <br></br>
            <h1>Coaches</h1>
            {project.coaches.map((coach) => {
                return (
                    <p key={coach.login_user.login_user_id}>
                        {coach.login_user.person.firstname}
                    </p>
                );
            })}
        </div>
    );
};
