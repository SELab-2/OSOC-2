import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Contract, NotificationType, Project, Student } from "../../types";
import styles from "./ProjectCard.module.css";
import { Label } from "../Labels/Label";
import { ProjectRole } from "../Labels/ProjectRole";
import { useDrop } from "react-dnd";
import SessionContext from "../../contexts/sessionProvider";
import { NotificationContext } from "../../contexts/notificationProvider";
import { Modal } from "../Modal/Modal";
import { useSockets } from "../../contexts/socketProvider";
import { defaultLoginUser } from "../../defaultLoginUser";

export const ProjectCard: React.FC<{
    project: Project;
    updateProject: () => void;
}> = ({ project, updateProject }) => {
    const router = useRouter();
    const [roleMap, setRoleMap] = useState<{ [K: string]: number }>({});
    const { getSession } = useContext(SessionContext);
    const { notify } = useContext(NotificationContext);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [droppedStudent, setDroppedStudent] = useState<Student>();
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const { socket } = useSockets();
    const { isAdmin } = useContext(SessionContext);

    const postAssign = async (student: Student, role: string) => {
        if (student === null || student.student === null) return;
        setShowModal(false);
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
        console.log("test");
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/project/${project.id}/assignee`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
                body: JSON.stringify({
                    studentId: student.student.student_id,
                    role: role,
                    jobApplicationId: student.jobApplication.job_application_id,
                }),
            }
        )
            .then((response) => response.json())
            .catch((err) => console.log(err));
        if (response !== undefined && response.success) {
            updateProject();
            if (notify) {
                notify(
                    `Successfully assigned ${student.student.person.name} to ${project.name}`,
                    NotificationType.SUCCESS,
                    2000
                );
            }
            socket.emit("projectModified", project.id);
        } else if (response !== undefined && !response.success) {
            if (notify) {
                notify(
                    `Could not assign ${student.student.person.name} to ${project.name}:
                ${response.reason}`,
                    NotificationType.ERROR,
                    3000
                );
            }
        }
    };

    const dropStudent = async (item: unknown) => {
        const student: Student = item as Student;
        setShowModal(true);
        setDroppedStudent(student);
    };

    const removeStudent = async (contract: Contract) => {
        if (contract.student === null || contract.student.student === null)
            return;
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/project/${project.id}/assignee`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
                body: JSON.stringify({
                    student: contract.student.student.student_id,
                }),
            }
        )
            .then((response) => response.json())
            .catch((err) => console.log(err));
        if (response !== undefined && response.success) {
            updateProject();
            if (notify) {
                notify(
                    `Successfully removed ${contract.student.student.person.name} from ${project.name}`,
                    NotificationType.SUCCESS,
                    2000
                );
            }
            socket.emit("projectModified", project.id);
        } else if (response !== undefined && !response.success) {
            if (notify) {
                notify(
                    `Could not remove ${contract.student.student.person.name} from ${project.name}:
                ${response.reason}`,
                    NotificationType.ERROR,
                    3000
                );
            }
        }
    };

    const deleteProject = async () => {
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/project/${project.id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            }
        )
            .then((response) => response.json())
            .catch((err) => console.log(err));
        if (response !== undefined && response.success) {
            updateProject();
            if (notify) {
                socket.emit("projectDeleted");
                notify(
                    `Project '${project.name}' successfully deleted!`,
                    NotificationType.SUCCESS,
                    3000
                );
            }
        } else if (response !== undefined && !response.success) {
            if (notify) {
                notify(
                    `Could not delete project ${project.name}: 
                ${response.reason}`,
                    NotificationType.ERROR,
                    3000
                );
            }
        }
    };

    const toggleDeleteModal = () => {
        setShowDeleteModal(true);
    };

    const [{ isOver }, drop] = useDrop(() => ({
        // The type (or types) to accept - strings or symbols
        accept: "Student",
        // Props to collect
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
        drop: (item) => {
            dropStudent(item).then();
        },
    }));

    const calculateRoleMap = () => {
        const map: { [K: string]: number } = {};
        for (const contract of project.contracts) {
            if (
                contract.student !== null &&
                contract.student.student !== null
            ) {
                map[contract.project_role.role.name] =
                    (map[contract.project_role.role.name] || 0) + 1;
            }
        }
        setRoleMap(map);
    };

    useEffect(() => {
        calculateRoleMap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project]);

    const formatDate = (date: string) => {
        const dateParts = date.split(" ");
        return `${dateParts[2]} ${dateParts[1]} ${dateParts[3]}`;
    };

    return (
        <div
            className={`${styles.body} ${isOver ? styles.over : ""}`}
            ref={drop}
        >
            <Modal
                handleClose={() => setShowDeleteModal(false)}
                visible={showDeleteModal}
                title={`Delete Project ${project.name}`}
            >
                <p>
                    You are about to delete a project! Deleting a project will
                    result in data loss. Are you certain that you wish to delete
                    project {project.name}?
                </p>
                <button data-testid={"confirmDelete"} onClick={deleteProject}>
                    DELETE
                </button>
            </Modal>
            <Modal
                handleClose={() => setShowModal(false)}
                title="Assign Student"
                visible={showModal}
            >
                <p>
                    Choose one of the following roles you want to assign the
                    student to:
                </p>
                {project.roles.map((role, index) => {
                    return (
                        <button
                            key={index}
                            onClick={() => {
                                if (droppedStudent !== undefined) {
                                    postAssign(
                                        droppedStudent,
                                        role.name
                                    ).then();
                                }
                            }}
                        >
                            {role.name}
                        </button>
                    );
                })}
            </Modal>
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

            <div>
                <h2>Assignees</h2>
                <div className={styles.assignees}>
                    {project.contracts.map((contract) => {
                        if (
                            contract.student === null ||
                            contract.student.student === null
                        )
                            return null;
                        if (contract.login_user === null) {
                            contract.login_user = defaultLoginUser;
                        }
                        return (
                            <div
                                className={`${styles.assignee} ${styles.card}`}
                                key={contract.contract_id}
                            >
                                <div>
                                    <h1>
                                        {contract.student.student.person.name}
                                    </h1>
                                    <div className={styles.assigneeBody}>
                                        <Label
                                            label={
                                                contract.project_role.role.name
                                            }
                                        />
                                        <p>{contract.login_user.person.name}</p>
                                    </div>
                                </div>
                                <button
                                    className={`${styles.delete} delete`}
                                    onClick={() => removeStudent(contract)}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={styles.description}>
                <h2>Project Description</h2>
                <p>{project.description}</p>
            </div>

            {isAdmin ? (
                <div className={styles.buttons}>
                    <button
                        onClick={() =>
                            router.push(`projects/${project.id}/change`)
                        }
                    >
                        Change
                    </button>
                    <button onClick={() => toggleDeleteModal()}>Delete</button>
                </div>
            ) : null}
        </div>
    );
};
