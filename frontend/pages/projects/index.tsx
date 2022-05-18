import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import SessionContext from "../../contexts/sessionProvider";
import { NotificationType, Project, Student } from "../../types";
import { ProjectCard } from "../../components/ProjectCard/ProjectCard";
import { Students } from "../../components/Students/Students";
import styles from "./projects.module.scss";
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult,
} from "react-beautiful-dnd";
import { Modal } from "../../components/Modal/Modal";
import { NotificationContext } from "../../contexts/notificationProvider";

const Index: NextPage = () => {
    const router = useRouter();
    const { getSession } = useContext(SessionContext);
    const [projects, setProjects] = useState<Project[]>([]);
    const [students, updateParentStudents] = useState<Student[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
    const [roleMap, setRoleMap] = useState<{ [K: string]: number }>({});
    const { notify } = useContext(NotificationContext);

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
        }
    };

    const handleButtonRole = async (e: SyntheticEvent) => {
        if (e.currentTarget.textContent) {
            await addStudentToProject(e.currentTarget.textContent);
        }
        setShowModal(false);
    };

    const addStudentToProject = async (role: string) => {
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };

        const body = {
            role: role,
            studentId: currentStudent?.student.student_id,
        };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/project/${currentProject?.id}/assignee`,
            {
                method: "POST",
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
        console.log(response);

        if (response === undefined) return;

        if (response.success) {
            await fetchProjects();
        } else {
            if (response.reason !== undefined && notify !== undefined) {
                notify(response.reason, NotificationType.WARNING, 3500);
            }
        }
    };

    const calculateRoleMap = (project: Project) => {
        const map: { [K: string]: number } = {};
        for (const contract of project.contracts) {
            map[contract.project_role.role.name] =
                (map[contract.project_role.role.name] || 0) + 1;
        }
        setRoleMap(map);
    };

    useEffect(() => {
        fetchProjects().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentProject, currentStudent]);

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const destination = result.destination;
        const source = result.source;
        if (destination.droppableId === "projects") {
            const student = students.at(source.index);
            const project = projects.at(destination.index);
            if (
                student &&
                project &&
                student.evaluation.evaluations.filter((x) => x.is_final)
                    .length == 1
            ) {
                calculateRoleMap(project);
                setCurrentProject(project);
                setCurrentStudent(student);
                setShowModal(true);
            }
        }
    };

    return (
        <div>
            <button
                onClick={() => {
                    router.push("/projects/create").then();
                }}
            >
                Add Project
            </button>
            {currentProject !== null ? (
                <Modal
                    handleClose={() => setShowModal(false)}
                    visible={showModal}
                    title={`Remove student`}
                >
                    <p>Please choose a role</p>
                    {currentProject.roles.map((role, index) => {
                        if (roleMap[role.name] < role.positions) {
                            return (
                                <button key={index} onClick={handleButtonRole}>
                                    {role.name}
                                </button>
                            );
                        }
                    })}
                </Modal>
            ) : null}

            <DragDropContext onDragEnd={onDragEnd}>
                <div className={styles.body}>
                    <Students
                        alwaysLimited={true}
                        dragDisabled={false}
                        updateParentStudents={updateParentStudents}
                    />

                    <Droppable droppableId={"projects"}>
                        {(provided) => (
                            <div ref={provided.innerRef}>
                                {projects.map((project, index) => {
                                    const id = project.id;
                                    return (
                                        <Draggable
                                            key={project.id}
                                            draggableId={
                                                "project:" + id.toString()
                                            }
                                            index={index}
                                            isDragDisabled={true}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <ProjectCard
                                                        key={project.id}
                                                        project={project}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            </DragDropContext>
        </div>
    );
};

export default Index;
