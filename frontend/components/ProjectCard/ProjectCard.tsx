import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Project, Student } from "../../types";
import styles from "./ProjectCard.module.css";
import { Modal } from "../Modal/Modal";
import SessionContext from "../../contexts/sessionProvider";

export const ProjectCard: React.FC<{
    project: Project;
    updateProject: () => void;
}> = ({ project, updateProject }) => {
    const router = useRouter();
    const [roleMap, setRoleMap] = useState<{ [K: string]: number }>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { getSession } = useContext(SessionContext);
    const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

    const calculateRoleMap = () => {
        const map: { [K: string]: number } = {};
        for (const contract of project.contracts) {
            map[contract.project_role.role.name] =
                (map[contract.project_role.role.name] || 0) + 1;
        }
        setRoleMap(map);
    };

    const formatDate = (date: string) => {
        const dateParts = date.split(" ");
        return `${dateParts[2]} ${dateParts[1]} ${dateParts[3]}`;
    };

    const setSelected = (student: Student) => {
        setShowDeleteModal(true);
        setCurrentStudent(student);
    };

    const deleteUser = async () => {
        setShowDeleteModal(false);
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };

        const body = {
            student: currentStudent?.student.student_id,
        };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/project/${project.id}/assignee`,
            {
                method: "DELETE",
                body: JSON.stringify(body),
                headers: {
                    Authorization: `auth/osoc2 ${sessionKey}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        )
            .then((response) => response.json())
            .catch((error) => console.log(error));
        if (response.success) {
            updateProject();
        }
        return;
    };

    useEffect(() => {
        calculateRoleMap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStudent, deleteUser]);

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
                    <div key={contract.student.student.student_id}>
                        <p>{contract.student.student.student_id}</p>
                        <button
                            className={`delete ${styles.delete}`}
                            onClick={() => setSelected(contract.student)}
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
