import { NextPage } from "next";
import { useRouter } from "next/router";
import { SyntheticEvent, useContext, useEffect, useState } from "react";
import SessionContext from "../../../contexts/sessionProvider";
import { Coach, NotificationType, OsocEdition, Project } from "../../../types";
import { Modal } from "../../../components/Modal/Modal";
import styles from "./change.module.scss";
import { useSockets } from "../../../contexts/socketProvider";
import { NotificationContext } from "../../../contexts/notificationProvider";

const Change: NextPage = () => {
    const router = useRouter();
    const { pid } = router.query; // pid is the student id
    const { getSession } = useContext(SessionContext);
    const { socket } = useSockets();
    const originalRoles: { [K: string]: number } = {};
    const { notify } = useContext(NotificationContext);

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
    const [osocId, setOsocId] = useState<string>("");
    const [osocYear, setOsocYear] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [roles, setRoles] = useState<string[]>([]);
    const [rolePositions, setRolePositions] = useState<{ [K: string]: string }>(
        {}
    );
    const [visible, setVisible] = useState<boolean>(false);
    const [newRoleName, setNewRoleName] = useState<string>("");
    const [newRolePositions, setNewRolePositions] = useState<string>("0");
    const [osocs, setOsocs] = useState<OsocEdition[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [selectedCoaches, setSelectedCoaches] = useState<number[]>([]);
    const [coachesActive, setCoachesActive] = useState<boolean>(false);
    const [originalCoaches] = useState<number[]>([]);

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
                    const roleList: string[] = [];
                    for (const role of response.data) {
                        roleList.push(role.name);
                    }
                    setRoles(roleList);
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

    const fetchCoaches = async () => {
        if (getSession != undefined) {
            getSession().then(async ({ sessionKey }) => {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/coach/all`,
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
                    setCoaches(response.data);
                }
            });
        }
    };

    const assignFields = (project: Project) => {
        setProjectName(project.name);
        setPartner(project.partner);
        setOsocId(project.osoc_id.toString());
        setStartDate(formatDate(project.start_date));
        setEndDate(formatDate(project.end_date));
        for (const role of project.roles) {
            originalRoles[role.name] = role.positions;
            rolePositions[role.name] = role.positions.toString();
        }
        setRolePositions((rolePositions) => ({
            ...rolePositions,
        }));
        for (const coach of project.coaches) {
            originalCoaches.push(coach.login_user.login_user_id);
            selectedCoaches.push(coach.login_user.login_user_id);
        }
    };

    useEffect(() => {
        if (router.isReady) {
            fetchProject().then();
            fetchRoles().then();
            fetchOsocs().then();
            fetchCoaches().then();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady]);

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
                        changeRole(newRoleName, newRolePositions);
                        roles.push(newRoleName);
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
                                start: new Date(startDate),
                                end: new Date(endDate),
                                osocId: osocId,
                                roles: { roles: getRoleList() },
                                addCoaches: { coaches: getAddCoaches() },
                                removeCoaches: { coaches: getRemoveCoaches() },
                            }),
                        }
                    )
                        .then((response) => response.json())
                        .catch((error) => console.log(error));
                    if (response !== undefined && response.success) {
                        alert("Project successfully changed!");
                        const pidNumber =
                            typeof pid === "string"
                                ? Number(pid)
                                : pid
                                ? Number(pid[0])
                                : NaN;
                        if (!isNaN(pidNumber)) {
                            socket.emit("projectModified", pidNumber);
                        }
                    } else if (notify && response !== null) {
                        notify(response.reason, NotificationType.ERROR, 2000);
                    }
                    router.push("/projects").then();
                }
            });
        }
    };

    const getAddCoaches = () => {
        const addCoaches: number[] = [];
        for (const coach of selectedCoaches) {
            if (!originalCoaches.includes(coach)) {
                addCoaches.push(coach);
            }
        }
        return addCoaches;
    };

    const getRemoveCoaches = () => {
        const removeCoaches: number[] = [];
        for (const coach of originalCoaches) {
            if (!selectedCoaches.includes(coach)) {
                removeCoaches.push(coach);
            }
        }
        return removeCoaches;
    };

    const getRoleList = () => {
        const roleList: { name: string; positions: number }[] = [];
        for (const role in rolePositions) {
            const obj = {
                name: role,
                positions: parseInt(rolePositions[role]),
            };
            roleList.push(obj);
        }
        return roleList;
    };

    const getOsocYear = () => {
        if (osocId != "") {
            for (const osoc of osocs) {
                if (osoc.osoc_id === Number(osocId)) {
                    return osoc.year.toString();
                }
            }
        } else {
            return osocYear;
        }
    };

    const getOsocId = (year: string) => {
        for (const osoc of osocs) {
            if (osoc.year === parseInt(year)) {
                return osoc.osoc_id.toString();
            }
        }
        setOsocYear(year);
        return "";
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

    const selectCoach = (id: number) => {
        if (selectedCoaches.includes(id)) {
            const index = selectedCoaches.indexOf(id);
            selectedCoaches.splice(index, 1);
        } else {
            selectedCoaches.push(id);
        }
        setSelectedCoaches([...selectedCoaches]);
    };

    return (
        <div className={styles.body}>
            <Modal title="Role Creation" visible={visible} handleClose={closer}>
                <div className={styles.modalContent}>
                    <p>
                        Type in the new role and the amount of positions
                        required
                    </p>
                    <label>
                        Role:
                        <input
                            className="input"
                            type="text"
                            name="role_name"
                            placeholder="name..."
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                        />
                    </label>

                    <label>
                        Positions:
                        <input
                            min={0}
                            className="input"
                            type="number"
                            name="role_positions"
                            value={newRolePositions}
                            onChange={(e) =>
                                setNewRolePositions(e.target.value)
                            }
                            onBlur={(e) => checkUnfocusNewRole(e.target.value)}
                        />
                    </label>
                    <button onClick={() => addNewRole()}>Add Role</button>
                </div>
            </Modal>

            <label>
                <h1>Project name</h1>
                <input
                    className="input"
                    type="text"
                    name="project_name"
                    placeholder="name..."
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                />
            </label>

            <label>
                <h1>Partner</h1>
                <input
                    className="input"
                    type="text"
                    name="partner"
                    placeholder="partner..."
                    value={partner}
                    onChange={(e) => setPartner(e.target.value)}
                />
            </label>

            <label>
                <h1>Osoc edition</h1>
                <input
                    className="input"
                    type="text"
                    name="osoc_edition"
                    placeholder="year..."
                    value={getOsocYear() || ""}
                    onChange={(e) => {
                        setOsocId(getOsocId(e.target.value));
                    }}
                />
            </label>

            <label>
                <h1>Start date</h1>
                <input
                    className="input"
                    type="date"
                    name="start_date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </label>

            <label>
                <h1>End date</h1>
                <input
                    className="input"
                    type="date"
                    name="end_date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </label>

            <div className={styles.rolesHeader}>
                <p>Add coaches to the project: </p>
                <div className={`dropdown ${coachesActive ? "is-active" : ""}`}>
                    <div
                        data-testid={"coachesSelectedFilterDisplay"}
                        className={`dropdown-trigger ${
                            coachesActive || selectedCoaches.length > 0
                                ? styles.active
                                : styles.inactive
                        } ${styles.dropdownTrigger}`}
                        onClick={() => setCoachesActive(!coachesActive)}
                    >
                        {selectedCoaches.length > 0
                            ? selectedCoaches.length === 1
                                ? `${selectedCoaches.length} coach selected`
                                : `${selectedCoaches.length} coaches selected`
                            : "No coaches selected"}
                        <div className={styles.triangleContainer}>
                            <div
                                className={`${coachesActive ? styles.up : ""} ${
                                    styles.triangle
                                }`}
                            />
                        </div>
                    </div>
                    <div className="dropdown-menu">
                        <div className="dropdown-content">
                            {coaches !== undefined
                                ? coaches.map((coach) => (
                                      <div
                                          data-testid={`testRoleItem=${coach.person_data.name}`}
                                          className={`${
                                              styles.dropdownItem
                                          } dropdown-item ${
                                              selectedCoaches.includes(
                                                  coach.login_user_id
                                              )
                                                  ? styles.selected
                                                  : ""
                                          }`}
                                          key={coach.login_user_id}
                                          onClick={() =>
                                              selectCoach(coach.login_user_id)
                                          }
                                      >
                                          {coach.person_data.name}
                                      </div>
                                  ))
                                : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.rolesHeader}>
                <p>Change the amount of positions for the necessary roles:</p>
                <button onClick={() => setVisible(true)}>+ Add role</button>
            </div>

            <div className={styles.roles}>
                {roles.map((role, index) => {
                    return (
                        <label key={index}>
                            <p>{role}:</p>
                            <input
                                className="input"
                                type="number"
                                value={getRolePositions(role)}
                                onChange={(e) =>
                                    changeRole(role, e.target.value)
                                }
                                onBlur={(e) => {
                                    checkUnfocus(role, e.target.value);
                                }}
                            />
                        </label>
                    );
                })}
            </div>

            <a onClick={() => setVisible(true)}>Create a new role</a>
            <br />
            <button onClick={handleConfirm}>CONFIRM</button>
        </div>
    );
};

export default Change;
