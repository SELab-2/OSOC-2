import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import SessionContext from "../../contexts/sessionProvider";
import { Project } from "../../types";
import { ProjectCard } from "../ProjectCard/ProjectCard";
import styles from "./Projects.module.scss";
import scrollStyles from "../ScrollView.module.scss";

/**
 * Projects page with project filter included
 * @constructor
 */
export const Projects: React.FC = () => {
    const router = useRouter();
    const { getSession } = useContext(SessionContext);
    const [projects, setProjects] = useState<Project[]>([]);

    const fetchProjects = async () => {
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/project/all`,
            {
                method: "GET",
                headers: {
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            }
        )
            .then((response) => response.json())
            .catch((error) => console.log(error));
        if (response !== undefined && response.success) {
            setProjects(response.data);
        } else {
            setProjects([]);
        }
    };

    useEffect(() => {
        fetchProjects().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={styles.projects}>
            <button
                onClick={() => {
                    router.push("/projects/create").then();
                }}
            >
                Add Project
            </button>
            <div className={scrollStyles.scrollView}>
                <div className={scrollStyles.topShadowCaster} />
                <div className={styles.projectCards}>
                    {projects.map((project) => {
                        return (
                            <div key={project.id} className={styles.card}>
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className={scrollStyles.bottomShadowCaster} />
            </div>
        </div>
    );
};
