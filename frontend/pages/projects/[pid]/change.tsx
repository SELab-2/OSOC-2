import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useContext, useState, SyntheticEvent } from "react";
import SessionContext from "../../../contexts/sessionProvider";
import { OsocEdition, Project } from "../../../types";
import { Modal } from "../../../components/Modal/Modal";

const Change: NextPage = () => {
    const router = useRouter();
    const { pid } = router.query; // pid is the student id
    const { getSession } = useContext(SessionContext);

    const formatDate = (date: string) => {
        const full_date = new Date(date);
        return [
            full_date.getFullYear(),
            padTo2Digits(full_date.getMonth() + 1),
            padTo2Digits(full_date.getDate()),
        ].join("-");
    };

    const padTo2Digits = (num: number) => {
        return num.toString().padStart(2, "0");
    };

    const [project, setProject] = useState<Project>();
    const [projectName, setProjectName] = useState<string>("");
    const [partner, setPartner] = useState<string>("");
    const [osocId, setOsocId] = useState<number>(0);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [rolePositions, setRolePositions] = useState<{ [K: string]: string }>(
        {}
    );
    const [visible, setVisible] = useState<boolean>(false);
    const [newRoleName, setNewRoleName] = useState<string>("");
    const [newRolePositions, setNewRolePositions] = useState<string>("0");
    const [osocs, setOsocs] = useState<OsocEdition[]>([]);

    const fetchProject = async () => {
        console.log("project");
        if (getSession !== undefined && pid !== undefined) {
            getSession().then(async ({ sessionKey }) => {
                if (sessionKey !== "") {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/project/${pid}`,
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
                        setProject(response);
                    }
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
                    const roleMap: { [K: string]: string } = {};
                    for (const role of response.data) {
                        if (!(role in rolePositions)) {
                            roleMap[role.name] = "0";
                        }
                    }
                    setRolePositions((rolePositions) => ({
                        ...rolePositions,
                        ...roleMap,
                    }));
                }
            });
        }
    };

    const fetchOsocs = async () => {
        if (getSession != undefined) {
            getSession().then(async ({ sessionKey }) => {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/osoc/all`,
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
                    setOsocs(response.data);
                }
            });
        }
    };

    const assignFields = () => {
        console.log("hello");
        console.log(project);
        if (project !== undefined) {
            setProjectName(project.name);
            setPartner(project.partner);
            setOsocId(project.osoc_id);
            setStartDate(formatDate(project.start_date));
            setEndDate(formatDate(project.end_date));
            for (const role of project.roles) {
                rolePositions[role.name] = role.positions.toString();
            }
            console.log(rolePositions);
            setRolePositions((rolePositions) => ({
                ...rolePositions,
            }));
        }
    };

    useEffect(() => {
        fetchProject().then();
        fetchRoles().then();
        fetchOsocs().then();
        assignFields();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addRole = (name: string, positions: string) => {
        const newRole: { [k: string]: string } = {};
        newRole[name] = positions;
        setRolePositions((rolePositions) => ({ ...rolePositions, ...newRole }));
    };

    const closer = (e: SyntheticEvent) => {
        e.preventDefault();
        setNewRoleName("");
        setNewRolePositions("0");
        setVisible(false);
    };

    const addNewRole = () => {
        if (getSession !== undefined) {
            getSession().then(async ({ sessionKey }) => {
                if (sessionKey != "") {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/role/create`,
                        {
                            method: "POST",
                            headers: {
                                Authorization: `auth/osoc2 ${sessionKey}`,
                                "Content-Type": "application/json",
                                Accept: "application/json",
                            },
                            body: JSON.stringify({
                                name: newRoleName,
                            }),
                        }
                    )
                        .then((response) => response.json())
                        .catch((error) => console.log(error));
                    if (response !== undefined && response.success) {
                        setVisible(false);
                        addRole(response.name, newRolePositions);
                        setNewRoleName("");
                        setNewRolePositions("0");
                    }
                }
            });
        }
    };

    const handleConfirm = () => {
        console.log("click");
    };

    const getOsocYear = () => {
        for (const osoc of osocs) {
            if (osoc.osoc_id === osocId) {
                return osoc.year;
            }
        }
    };

    const getOsocId = (year: string) => {
        for (const osoc of osocs) {
            if (osoc.year === parseInt(year)) {
                return osoc.osoc_id;
            }
        }
        return -1; //this is not possible
    };

    return (
        <div>
            <Modal
                title="Type in the role name and the number of positions"
                visible={visible}
                handleClose={closer}
            >
                <label>Role: </label>
                <input
                    type="text"
                    name="role_name"
                    placeholder="name..."
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                />
                <br />
                <label>Positions: </label>
                <input
                    type="number"
                    name="role_positions"
                    value={newRolePositions}
                    onChange={(e) => setNewRolePositions(e.target.value)}
                />
                <br />
                <button onClick={() => addNewRole()}>Add Role</button>
            </Modal>
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
                value={getOsocYear()}
                onChange={(e) => {
                    setOsocId(getOsocId(e.target.value));
                }}
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
            <p>Change the amount of positions for the necessary roles:</p>
            {Object.keys(rolePositions).map((role) => {
                return (
                    <div key={role}>
                        <div>
                            <label> {role}: </label>
                            <input
                                type="number"
                                value={rolePositions[role]}
                                onChange={(e) => addRole(role, e.target.value)}
                            />
                        </div>
                    </div>
                );
            })}
            <a onClick={() => setVisible(true)}>Create a new role</a>
            <br />
            <button onClick={handleConfirm}>CONFIRM</button>
        </div>
    );
};

export default Change;
