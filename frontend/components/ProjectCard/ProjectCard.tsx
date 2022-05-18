import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Project } from "../../types";
import styles from "./ProjectCard.module.css";
import { Label } from "../Labels/Label";
import { ProjectRole } from "../Labels/ProjectRole";

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    console.log(project);
    const router = useRouter();
    const [roleMap, setRoleMap] = useState<{ [K: string]: number }>({});

    const calculateRoleMap = () => {
        const map: { [K: string]: number } = {};
        for (const contract of project.contracts) {
            map[contract.project_role.role.name] =
                (map[contract.project_role.role.name] || 0) + 1;
        }
        setRoleMap(map);
    };

    useEffect(() => {
        calculateRoleMap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDate = (date: string) => {
        const dateParts = date.split(" ");
        return `${dateParts[2]} ${dateParts[1]} ${dateParts[3]}`;
    };

    return (
        <div className={styles.body}>
            <header>
                <div className={styles.left}>
                    <div>
                        <h2>{project.name}</h2>
                        <p>
                            {formatDate(project.start_date)} -{" "}
                            {formatDate(project.end_date)}
                        </p>
                    </div>
                    <h3>{project.partner}</h3>
                    <div className={styles.coaches}>
                        {project.coaches.map((coach) => {
                            return (
                                <Label
                                    key={coach.login_user.login_user_id}
                                    label={coach.login_user.person.name}
                                />
                            );
                        })}
                    </div>
                </div>
                <div className={styles.roles}>
                    {project.roles.map((role) => {
                        return (
                            <ProjectRole
                                key={role.name}
                                label={role.name}
                                positions={`${roleMap[role.name] || 0}/${
                                    role.positions
                                }`}
                            />
                        );
                    })}
                </div>
            </header>

            <div className={styles.assignees}>
                <h1>Assignees</h1>
                {project.contracts.map((contract) => {
                    return (
                        <p key={contract.project_role.project_role_id}>hello</p>
                    );
                })}
            </div>

            <div className={styles.description}>
                <h1>Project Description</h1>
                <p>{project.description}</p>
            </div>

            <button
                onClick={() => router.push(`projects/${project.id}/change`)}
            >
                Change
            </button>
        </div>
    );
};
