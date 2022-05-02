import { NextPage } from "next";
import { useContext, useEffect, useState } from "react";
import SessionContext from "../contexts/sessionProvider";
import { Project, Student, Display } from "../types";
import { ProjectCard } from "../components/ProjectCard/ProjectCard";
import { StudentCard } from "../components/StudentCard/StudentCard";
import styles from "../styles/students.module.scss";

const Projects: NextPage = () => {
    const { getSession } = useContext(SessionContext);
    const [projects, setProjects] = useState<Project[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

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

    const fetchStudents = async () => {
        if (getSession != undefined) {
            getSession().then(async ({ sessionKey }) => {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/student/all`,
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
                    setStudents(response.data);
                }
            });
        }
    };

    useEffect(() => {
        fetchProjects().then();
        fetchStudents().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={`${styles.students} ${styles.limited}`}>
            <div className={`${styles.students} ${styles.limited}`}>
                {students.map((student) => {
                    return (
                        <div
                            key={student.student.student_id}
                            className={styles.card}
                        >
                            <StudentCard
                                student={student}
                                display={Display.LIMITED}
                            />
                        </div>
                    );
                })}
                {projects.map((project) => {
                    return <ProjectCard key={project.id} project={project} />;
                })}
            </div>
        </div>
    );
};

export default Projects;
