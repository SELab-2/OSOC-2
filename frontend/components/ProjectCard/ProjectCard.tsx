import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Project } from "../../types";
import styles from "./ProjectCard.module.css";
import { Modal } from "../Modal/Modal";

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const router = useRouter();
    const [roleMap, setRoleMap] = useState<{ [K: string]: number }>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(-1);
    const [currentProject, setCurrentProject] = useState(-1);

    const calculateRoleMap = () => {
        const map: { [K: string]: number } = {};
        for (const contract of project.contracts) {
            map[contract.project_role.role.name] =
                (map[contract.project_role.role.name] || 0) + 1;
        }
        setRoleMap(map);
    };

    useEffect(() => {
        console.log(project.contracts.at(0)?.student);
        calculateRoleMap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDate = (date: string) => {
        const dateParts = date.split(" ");
        return `${dateParts[2]} ${dateParts[1]} ${dateParts[3]}`;
    };

    const setSelectedIds = (studentId: number, projectId: number) => {
        setShowDeleteModal(true);
        setCurrentProject(projectId);
        setCurrentStudent(studentId);
    };

    const deleteUser = () => {
        setShowDeleteModal(false);
        console.log(currentProject);
        console.log(currentStudent);
        return;
    };

    return (
        <div className={styles.card}>
            <div>
                <h2>{project.name}</h2>
                <p>
                    {formatDate(project.start_date)} -{" "}
                    {formatDate(project.end_date)}
                </p>
            </div>
            <p>{project.partner}</p>
            <br></br>
            <h1>Coaches</h1>
            {project.coaches.map((coach) => {
                return (
                    <p key={coach.login_user.login_user_id}>
                        {coach.login_user.person.name}
                    </p>
                );
            })}
            <br></br>
            <h1>Roles</h1>
            {project.roles.map((role) => {
                return (
                    <div key={role.name}>
                        <p>
                            {role.name} {roleMap[role.name]}/{role.positions}
                        </p>
                    </div>
                );
            })}
            <br></br>
            <Modal
                handleClose={() => setShowDeleteModal(false)}
                visible={showDeleteModal}
                title={`Remove student`}
            >
                <p>You are?</p>
                <button data-testid={"confirmDelete"} onClick={deleteUser}>
                    Remove
                </button>
            </Modal>
            <h1>Assignees</h1>
            {project.contracts.map((contract) => {
                return (
                    <div key={contract.project_role.project_role_id}>
                        <p>hello</p>
                        <button
                            className={`delete ${styles.delete}`}
                            onClick={() =>
                                setSelectedIds(
                                    contract.student.student.student_id,
                                    project.id
                                )
                            }
                        />
                    </div>
                );
            })}
            <br></br>
            <h1>Project Info</h1>
            <p>{project.description}</p>
            <button
                onClick={() => router.push(`projects/${project.id}/change`)}
            >
                Change
            </button>
        </div>
    );
};
