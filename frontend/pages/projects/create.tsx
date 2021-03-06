import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState, useContext, SyntheticEvent } from "react";
import SessionContext from "../../contexts/sessionProvider";
import { Coach, NotificationType, AccountStatus } from "../../types";
import { Modal } from "../../components/Modal/Modal";
import styles from "./create.module.scss";
import { NotificationContext } from "../../contexts/notificationProvider";
import { useSockets } from "../../contexts/socketProvider";

const Create: NextPage = () => {
    const router = useRouter();
    const { getSession } = useContext(SessionContext);
    const { notify } = useContext(NotificationContext);
    const { socket } = useSockets();

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
    const [startDate, setStartDate] = useState<string>(formatDate());
    const [endDate, setEndDate] = useState<string>(formatDate());
    const [description, setDescription] = useState<string>("");
    const [rolePositions, setRolePositions] = useState<{ [K: string]: string }>(
        {}
    );
    const [visible, setVisible] = useState<boolean>(false);
    const [newRoleName, setNewRoleName] = useState<string>("");
    const [newRolePositions, setNewRolePositions] = useState<string>("0");
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [selectedCoaches, setSelectedCoaches] = useState<number[]>([]);
    const [coachesActive, setCoachesActive] = useState<boolean>(false);
    const [osocId, setOsoscId] = useState<number>(0);
    const [osocYear, setOsocYear] = useState<number>(0);

    const updateNewRolePositions = (positions: string) => {
        if (Number(positions) < 0) return; // Only allow positive values
        setNewRolePositions(positions);
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
                    for (const coach of response.data) {
                        if (coach.activated === AccountStatus.ACTIVATED) {
                            coaches.push(coach);
                        }
                    }
                    setCoaches([...coaches]);
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
                        roleMap[role.name] = "0";
                    }
                    setRolePositions(roleMap);
                }
            });
        }
    };

    const fetchLatestOsocEdition = async () => {
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
                    let latestYearId = 0;
                    let latestYear = 0;
                    for (const osoc of response.data) {
                        if (osoc.year > latestYear) {
                            latestYearId = osoc.osoc_id;
                            latestYear = osoc.year;
                        }
                    }
                    setOsoscId(latestYearId);
                    setOsocYear(latestYear);
                }
            });
        }
    };

    useEffect(() => {
        fetchRoles().then();
        fetchCoaches().then();
        fetchLatestOsocEdition().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleConfirm = async () => {
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };

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
                    osocId: osocId,
                    positions: getTotalPositions(),
                    roles: { roles: getRoleList() },
                    description: description,
                    coaches: { coaches: selectedCoaches },
                }),
            }
        )
            .then((response) => response.json())
            .catch((error) => console.log(error));
        if (response !== undefined && response.success) {
            if (notify) {
                notify(
                    "Project succesfully created!",
                    NotificationType.SUCCESS,
                    2000
                );
            }
            socket.emit("projectCreated");
        } else if (notify && response !== null) {
            notify(response.reason, NotificationType.ERROR, 5000);
        }
        router.push("/projects").then();
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
        if (Number(positions) < 0) return; // Only allow positive values
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

    const selectCoach = (id: number) => {
        if (selectedCoaches.includes(id)) {
            const index = selectedCoaches.indexOf(id);
            selectedCoaches.splice(index, 1);
        } else {
            selectedCoaches.push(id);
        }
        setSelectedCoaches([...selectedCoaches]);
    };

    const checkUnfocus = (name: string, positions: string) => {
        if (positions === "") {
            addRole(name, "0");
        }
    };

    const checkUnfocusNewRole = (positions: string) => {
        if (positions === "") {
            setNewRolePositions("0");
        }
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
                                updateNewRolePositions(e.target.value)
                            }
                            onBlur={(e) => checkUnfocusNewRole(e.target.value)}
                        />
                    </label>
                    <button onClick={() => addNewRole()}>Add Role</button>
                </div>
            </Modal>

            <p>OSOC Edition: {osocYear}</p>

            <label>
                <h1>Project name</h1>
                <input
                    data-testid={"nameInput"}
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
                    data-testid={"partnerInput"}
                    className="input"
                    type="text"
                    name="partner"
                    placeholder="partner..."
                    value={partner}
                    onChange={(e) => setPartner(e.target.value)}
                />
            </label>

            <label>
                <h1>Short description</h1>
                <input
                    data-testid={"descriptionInput"}
                    className="input"
                    type="text"
                    name="description"
                    placeholder="description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </label>

            <label>
                <h1>Start date</h1>
                <input
                    data-testid={"startDateInput"}
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
                    data-testid={"endDateInput"}
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
                {Object.keys(rolePositions).map((role, index) => {
                    return (
                        <label key={index}>
                            <p>{role}:</p>
                            <input
                                className="input"
                                type="number"
                                value={rolePositions[role]}
                                min={0}
                                onChange={(e) => addRole(role, e.target.value)}
                                onBlur={(e) => {
                                    checkUnfocus(role, e.target.value);
                                }}
                            />
                        </label>
                    );
                })}
            </div>

            <br />
            <button data-testid={"confirmButton"} onClick={handleConfirm}>
                CONFIRM
            </button>
        </div>
    );
};

export default Create;
