import { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import SessionContext from "../../contexts/sessionProvider";
import { Project } from "../../types";
import { ProjectCard } from "../../components/ProjectCard/ProjectCard";
import { Students } from "../../components/Students/Students";
import styles from "../../styles/projects.module.scss";

const Index: NextPage = () => {
    const router = useRouter();
    const { getSession } = useContext(SessionContext);
    const [projects, setProjects] = useState<Project[]>([]);

    const fetchProjects = async () => {
        if (getSession != undefined) {
            getSession().then(async ({ sessionKey }) => {
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
                }
            });
        }
    };

    useEffect(() => {
        fetchProjects().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <button
                onClick={() => {
                    router.push("/projects/create");
                }}
            >
                Add Project
            </button>
            <div className={styles.body}>
                <Students alwaysLimited={true} />
                <div>
                    {projects.map((project) => {
                        return (
                            <ProjectCard key={project.id} project={project} />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Index;
