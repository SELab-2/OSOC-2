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
            <br></br>
            <h1>Roles</h1>
            {project.roles.map((role) => {
                return <p key={role.name}>{role.name}</p>;
            })}
            <br></br>
            <h1>Assignees</h1>
            {project.contracts.map((contract) => {
                return <p key={contract.project_role.project_role_id}>hello</p>;
            })}
        </div>
    );
};
