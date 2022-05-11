import { NextPage } from "next";
import { useContext, useEffect, useState, SyntheticEvent } from "react";
import SessionContext from "../contexts/sessionProvider";
import { Project, Role } from "../types";
import { ProjectCard } from "../components/ProjectCard/ProjectCard";
import { Students } from "../components/Students/Students";
import styles from "../styles/projects.module.scss";
import { Modal } from "../components/Modal/Modal";

const Projects: NextPage = () => {
    const { getSession } = useContext(SessionContext);
    const [projects, setProjects] = useState<Project[]>([]);
    const [showAddProject, setShowAddProject] = useState<boolean>(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [projectName, setProjectName] = useState<string>("");
    const [partner, setPartner] = useState<string>("");
    const [osocEdition, setOsocEdition] = useState<string>("");
    const [startDate, setStartDate] = useState<string>(Date());
    const [endDate, setEndDate] = useState<string>(Date());
    const [positions, setPositions] = useState<string>("0");
    const [rolePositions, setRolePositions] = useState<{ [K: string]: string }>(
        {}
    );

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

    const fetchRoles = async () => {
        if (getSession != undefined) {
            getSession().then(async ({ sessionKey }) => {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/role/all`,
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
                    setRoles(response.data);
                }
            });
        }
    };

    const handleConfirm = () => {
        setShowAddProject(false);
    };

    const showAddProjectModal = () => {
        setShowAddProject(true);
        console.log("hallo");
    };

    const closer = (e: SyntheticEvent) => {
        e.preventDefault();
        setShowAddProject(false);
    };

    useEffect(() => {
        fetchProjects().then();
        fetchRoles().then();
        // We do not want to reload the data when the data changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <Modal
                visible={showAddProject}
                handleClose={closer}
                title={"Fill in the following fields to add a project."}
            >
                <p>Project name</p>
                <input
                    type="text"
                    name="project_name"
                    placeholder="name..."
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                />
                <p>Partner</p>
                <input
                    type="text"
                    name="partner"
                    placeholder="partner..."
                    value={partner}
                    onChange={(e) => setPartner(e.target.value)}
                />
                <p>Osoc edition</p>
                <input
                    type="text"
                    name="osoc_edition"
                    placeholder="year..."
                    value={osocEdition}
                    onChange={(e) => setOsocEdition(e.target.value)}
                />
                <p>Start date</p>
                <input
                    type="date"
                    name="start_date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <p>End date</p>
                <input
                    type="date"
                    name="end_date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <p>Total Students Required</p>
                <input
                    type="number"
                    name="positions"
                    min="0"
                    value={positions}
                    onChange={(e) => setPositions(e.target.value)}
                />
                <p>Pick the necessary roles</p>
                {roles.map((role) => {
                    return (
                        <div key={role.role_id}>
                            <input type="checkbox" id={role.name} />
                            <label> {role.name} </label>
                            <div>
                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        parseInt(rolePositions[role.name]) ||
                                        "0"
                                    }
                                    onChange={(e) => {
                                        const map = rolePositions;
                                        map[role.name] = e.target.value;
                                        setRolePositions(map);
                                    }}
                                />
                                <label> Add number of positions</label>
                            </div>
                            <br />
                        </div>
                    );
                })}
                <p>Or create a new role</p>
                <input type="text" name="osoc_edition" placeholder="year..." />
                <button onClick={handleConfirm}>CONFIRM</button>
            </Modal>
            <button onClick={() => showAddProjectModal()}>Add Project</button>
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

export default Projects;
