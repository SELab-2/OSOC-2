import { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import SessionContext from "../../contexts/sessionProvider";
import { Project, Student } from "../../types";
import { ProjectCard } from "../../components/ProjectCard/ProjectCard";
import { Students } from "../../components/Students/Students";
import styles from "../../styles/projects.module.scss";
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult,
} from "react-beautiful-dnd";

const Index: NextPage = () => {
    const router = useRouter();
    const { getSession } = useContext(SessionContext);
    const [projects, setProjects] = useState<Project[]>([]);
    const [students, updateParentStudents] = useState<Student[]>([]);

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

    const addStudentProject = async (student: Student, project: Project) => {
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
        console.log(student);
        console.log(project);

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

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const destination = result.destination;
        const source = result.source;
        if (destination.droppableId === "projects") {
            const student = students.at(source.index);
            const project = projects.at(destination.index);
            if (student && project) {
                await addStudentProject(student, project);
            }
        }
        console.log(result.source);
        console.log(result);
    };

    return (
        <div>
            <button
                onClick={() => {
                    router.push("/projects/create");
                }}
            >
                Add Project
            </button>
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
                                            key={"project:" + id.toString()}
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
