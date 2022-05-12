import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState, useContext, SyntheticEvent } from "react";
import SessionContext from "../../contexts/sessionProvider";
import { OsocEdition } from "../../types";
import { Modal } from "../../components/Modal/Modal";

const Create: NextPage = () => {
    const router = useRouter();
    const { getSession } = useContext(SessionContext);

    const formatDate = () => {
        const date = new Date();
        return [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate()),
        ].join("-");
    };

    const padTo2Digits = (num: number) => {
        return num.toString().padStart(2, "0");
    };

    const [projectName, setProjectName] = useState<string>("");
    const [partner, setPartner] = useState<string>("");
    const [osocEdition, setOsocEdition] = useState<string>("");
    const [startDate, setStartDate] = useState<string>(formatDate());
    const [endDate, setEndDate] = useState<string>(formatDate());
    const [rolePositions, setRolePositions] = useState<{ [K: string]: string }>(
        {}
    );
    const [visible, setVisible] = useState<boolean>(false);
    const [newRoleName, setNewRoleName] = useState<string>("");
    const [newRolePositions, setNewRolePositions] = useState<string>("0");
    const [osocs, setOsocs] = useState<OsocEdition[]>([]);

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
                        roleMap[role.name] = "0";
                    }
                    setRolePositions(roleMap);
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

    useEffect(() => {
        fetchRoles().then();
        fetchOsocs().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleConfirm = () => {
        if (getSession !== undefined) {
            getSession().then(async ({ sessionKey }) => {
                if (sessionKey != "") {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/project`,
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
                                osocId: getOsocId(osocEdition),
                                positions: getTotalPositions(),
                                roles: { roles: getRoleList() },
                            }),
                        }
                    )
                        .then((response) => response.json())
                        .catch((error) => console.log(error));
                    if (response !== undefined && response.success) {
                        alert("Project succesfully created!");
                        router.push("/projects");
                    }
                }
            });
        }
    };

    const getOsocId = (year: string) => {
        for (const osoc of osocs) {
            if (osoc.year === parseInt(year)) {
                return osoc.osoc_id;
            }
        }
    };

    const getTotalPositions = () => {
        let total = 0;
        for (const key in rolePositions) {
            total += parseInt(rolePositions[key]);
        }
        return total;
    };

    const getRoleList = () => {
        const roleList = [];
        for (const role in rolePositions) {
            if (parseInt(rolePositions[role]) > 0) {
                const obj = {
                    name: role,
                    positions: parseInt(rolePositions[role]),
                };
                roleList.push(obj);
            }
        }
        return roleList;
    };

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

export default Create;