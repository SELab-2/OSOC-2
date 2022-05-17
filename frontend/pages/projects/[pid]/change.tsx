import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useContext, useState, SyntheticEvent } from "react";
import SessionContext from "../../../contexts/sessionProvider";
import { OsocEdition, Project, Role } from "../../../types";
import { Modal } from "../../../components/Modal/Modal";

const Change: NextPage = () => {
    const router = useRouter();
    const { pid } = router.query; // pid is the student id
    const { getSession } = useContext(SessionContext);
    const originalRoles: { [K: string]: number } = {};

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

    const [projectName, setProjectName] = useState<string>("");
    const [partner, setPartner] = useState<string>("");
    const [osocId, setOsocId] = useState<number>(0);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [roles, setRoles] = useState<Role[]>([]);
    const [rolePositions, setRolePositions] = useState<{ [K: string]: string }>(
        {}
    );
    const [visible, setVisible] = useState<boolean>(false);
    const [newRoleName, setNewRoleName] = useState<string>("");
    const [newRolePositions, setNewRolePositions] = useState<string>("0");
    const [osocs, setOsocs] = useState<OsocEdition[]>([]);

    const fetchProject = async () => {
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
                        assignFields(response);
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
                    setRoles(response.data);
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

    const assignFields = (project: Project) => {
        setProjectName(project.name);
        setPartner(project.partner);
        setOsocId(project.osoc_id);
        setStartDate(formatDate(project.start_date));
        setEndDate(formatDate(project.end_date));
        for (const role of project.roles) {
            originalRoles[role.name] = role.positions;
            rolePositions[role.name] = role.positions.toString();
        }
        setRolePositions((rolePositions) => ({
            ...rolePositions,
        }));
    };

    useEffect(() => {
        if (router.isReady) {
            fetchProject().then();
            fetchRoles().then();
            fetchOsocs().then();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady]);

    const addRole = (name: string, positions: string) => {
        const newRole: { [k: string]: string } = {};
        newRole[name] = positions;
        setRolePositions((rolePositions) => ({ ...rolePositions, ...newRole }));
    };

    const changeRole = (name: string, positions: string) => {
        rolePositions[name] = positions;
        setRolePositions((rolePositions) => ({ ...rolePositions }));
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
        if (getSession !== undefined) {
            getSession().then(async ({ sessionKey }) => {
                if (sessionKey != "") {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/project/${pid}`,
                        {
                            method: "POST",
                            headers: {
                                Authorization: `auth/osoc2 ${sessionKey}`,
                                "Content-Type": "application/json",
                                Accept: "application/json",
                            },
                            body: JSON.stringify({
                                name: projectName,
                                partner: partner,
                                start: startDate,
                                end: endDate,
                                osocId: osocId,
                                deleteRoles: { roles: getDeleteRoles() },
                                modifyRoles: { roles: getModifyRoles() },
                            }),
                        }
                    )
                        .then((response) => response.json())
                        .catch((error) => console.log(error));
                    if (response !== undefined && response.success) {
                        alert("Project succesfully changed!");
                        router.push("/projects").then();
                    }
                }
            });
        }
    };

    // const createBodyObject = () => {
    //     const body = {};
    //     body[name] = projectName;
    //     body[partner] = partner;
    //     body[start] = startDate,
    //     body[end] = endDate,
    //     body[osocId] = osocId,
    //     const deleteRoles = getDeleteRoles();

    //     const
    // }

    const getModifyRoles = () => {
        const modifyRoles: { id: number; positions: number }[] = [];
        Object.keys(rolePositions).map((role) => {
            if (role in originalRoles) {
                if (parseInt(rolePositions[role]) !== originalRoles[role]) {
                    modifyRoles.push({
                        id: getRoleId(role),
                        positions: parseInt(rolePositions[role]),
                    });
                }
            } else {
                if (parseInt(rolePositions[role]) !== 0) {
                    modifyRoles.push({
                        id: getRoleId(role),
                        positions: parseInt(rolePositions[role]),
                    });
                }
            }
        });
    };

    const getDeleteRoles = () => {
        const deleteRoles: number[] = [];
        Object.keys(rolePositions).map((role) => {
            if (role in originalRoles) {
                if (rolePositions[role] == "0") {
                    deleteRoles.push(getRoleId(role));
                }
            }
        });
        return deleteRoles;
    };

    const getRoleId = (name: string) => {
        for (const role of roles) {
            if (role.name === name) {
                return role.role_id;
            }
        }
        return -1; // role is not in the role list => not possible
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

    const getRolePositions = (name: string) => {
        if (!(name in rolePositions)) {
            return "0";
        }
        return rolePositions[name];
    };

    const checkUnfocus = (name: string, positions: string) => {
        if (positions === "") {
            changeRole(name, "0");
        }
    };

    const checkUnfocusNewRole = (positions: string) => {
        if (positions === "") {
            setNewRolePositions("0");
        }
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
                    onBlur={(e) => checkUnfocusNewRole(e.target.value)}
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
                value={getOsocYear() || 0}
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
            {roles.map((role) => {
                return (
                    <div key={role.role_id}>
                        <div>
                            <label> {role.name}: </label>
                            <input
                                type="number"
                                value={getRolePositions(role.name)}
                                onChange={(e) =>
                                    changeRole(role.name, e.target.value)
                                }
                                onBlur={(e) => {
                                    checkUnfocus(role.name, e.target.value);
                                }}
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
