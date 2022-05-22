import styles from "./User.module.css";
import AdminIconColor from "../../public/images/admin_icon_color.png";
import AdminIcon from "../../public/images/admin_icon.png";
import CoachIconColor from "../../public/images/coach_icon_color.png";
import CoachIcon from "../../public/images/coach_icon.png";
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png";
import ForbiddenIcon from "../../public/images/forbidden_icon.png";
import React, {
    SyntheticEvent,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import Image from "next/image";
import SessionContext from "../../contexts/sessionProvider";
import {
    AccountStatus,
    LoginUser,
    OsocEdition,
    NotificationType,
} from "../../types";
import { useSockets } from "../../contexts/socketProvider";
import { Modal } from "../Modal/Modal";
import triangle from "../Filters/Filter.module.css";
import { NotificationContext } from "../../contexts/notificationProvider";
import { defaultLoginUser } from "../../defaultLoginUser";

export const User: React.FC<{
    user: LoginUser;
    editions: OsocEdition[];
    removeUser: (user: LoginUser) => void;
}> = ({ user, removeUser, editions }) => {
    if (user == null) {
        user = defaultLoginUser;
    }
    const [name] = useState<string>(user.person.name);
    const [email] = useState<string>(user.person.email);
    const [isAdmin, setIsAdmin] = useState<boolean>(user.is_admin);
    const [isCoach, setIsCoach] = useState<boolean>(user.is_coach);
    const [status, setStatus] = useState<AccountStatus>(user.account_status);
    const { getSession } = useContext(SessionContext);
    const { socket } = useSockets();
    const userId = user.login_user_id;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { notify } = useContext(NotificationContext);
    const [hasYearPermListener, setYearPermListener] = useState(false);
    // a set of edition ids the user is allowed to see
    const [userEditions, setUserEditions] = useState<Set<number>>(new Set());
    // dropdown open or closed
    const [editionsActive, setEditionsActive] = useState<boolean>(false);

    // needed for when an update is received via websockets
    useEffect(() => {
        setIsAdmin(user.is_admin);
        setIsCoach(user.is_coach);
        setStatus(user.account_status);
    }, [user]);

    /**
     * remove the listeners when dismounting the component
     */
    useEffect(() => {
        return () => {
            socket.off("yearPermissionUpdated");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isAdmin && !isCoach) {
            setStatus(() => AccountStatus.DISABLED);
        }
    }, [isAdmin, isCoach]);

    // load
    useEffect(() => {
        fetchUserEditions().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUserEditions = useCallback(async () => {
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/user/years/${userId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            }
        )
            .then((response) => response.json())
            .catch((error) => console.log(error));
        if (Array.isArray(response)) {
            const ids = [];
            for (const edition of response) {
                ids.push(edition.osoc_id);
            }
            setUserEditions(new Set(ids));
        }
    }, [getSession, userId]);

    /**
     * websocket listeners that update the visible years for a loginUser
     * we use the state to check if there is already a listener in this User
     * If there is no listener we register a new one
     */
    useEffect(() => {
        if (hasYearPermListener) {
            return;
        }
        setYearPermListener(true);
        socket.on("yearPermissionUpdated", (loginUserId: number) => {
            if (user.login_user_id === loginUserId) {
                fetchUserEditions().then();
            }
        });
    }, [user, socket, fetchUserEditions, hasYearPermListener]);

    const setUserRole = async (
        route: string,
        changed_val: string,
        admin_bool: boolean,
        coach_bool: boolean,
        status_enum: AccountStatus
    ) => {
        const json_body = JSON.stringify({
            isCoach: coach_bool,
            isAdmin: admin_bool,
            accountStatus: status_enum,
        });
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/` +
                route +
                "/" +
                userId.toString(),
            {
                method: "POST",
                body: json_body,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            }
        )
            .then((response) => response.json())
            .catch((err) => {
                console.log(err);
            });
        if (response.success !== false) {
            if (changed_val === "activated") {
                socket.emit("activateUser");
            } else if (changed_val === "disabled") {
                socket.emit("disableUser");
            }
            // also emit that there has been a change in general so that the manage users screen will update
            // other changes are changes to the enum roles
            socket.emit("updateRoleUser");
            if (notify) {
                notify(
                    `Successfully updated ${name} authorities`,
                    NotificationType.SUCCESS,
                    2000
                );
            }
        } else if (response && !response.success && notify) {
            notify(
                "Something went wrong:" + response.reason,
                NotificationType.ERROR,
                2000
            );
        }
        return response;
    };

    const toggleIsAdmin = async (e: SyntheticEvent) => {
        e.preventDefault();
        // don't do anything to the roles when the account is still pending
        if (status === AccountStatus.PENDING) {
            return;
        }
        // when account is disabled and we set admin (== currently admin is disabled) => set account to activated
        // when we disable admin (== currently enabled) but coach is still active => keep account active, otherwise disable the account
        const statusToSet =
            !isAdmin || isCoach
                ? AccountStatus.ACTIVATED
                : AccountStatus.DISABLED;
        const response = await setUserRole(
            "admin",
            "admin",
            !isAdmin,
            isCoach,
            statusToSet
        );
        if (response.success) {
            setIsAdmin((isAdmin) => !isAdmin);
            setStatus(statusToSet);
        }
    };

    const toggleIsCoach = async (e: SyntheticEvent) => {
        e.preventDefault();
        // don't do anything to the roles when the account is still pending
        if (status === AccountStatus.PENDING) {
            return;
        }
        // when account is disabled and we set coach (== currently coach is disabled) => set account to activated
        // when we disable coach (== currently enabled) but admin is still active => keep account active, otherwise disable the account
        const statusToSet =
            !isCoach || isAdmin
                ? AccountStatus.ACTIVATED
                : AccountStatus.DISABLED;
        const response = await setUserRole(
            "coach",
            "coach",
            isAdmin,
            !isCoach,
            statusToSet
        );
        if (response.success) {
            setIsCoach(!isCoach);
            setStatus(statusToSet);
        }
    };

    const toggleStatus = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (status === AccountStatus.ACTIVATED) {
            const response = await setUserRole(
                "coach",
                "disabled", // the account is still on activated => we disable the account
                false, // when the account is disabled we remove all the admin perms
                false, // when the account is disabled we remove all the coach perms
                AccountStatus.DISABLED
            );
            if (response && response.success) {
                setStatus(() => AccountStatus.DISABLED);
                setIsAdmin(() => false);
                setIsCoach(() => false);
            }
        } else if (status === AccountStatus.DISABLED) {
            const response = await setUserRole(
                "coach",
                "activated", // the account is still on disabled => we enable the account
                isAdmin,
                true, // when activating an account we always want to set the user to be a coach
                AccountStatus.ACTIVATED
            );
            if (response && response.success) {
                setIsCoach(true);
                setStatus(() => AccountStatus.ACTIVATED);
            }
        }
    };

    const activateUser = async (e: SyntheticEvent) => {
        e.preventDefault();
        const response = await setUserRole(
            "coach",
            "activated",
            isAdmin,
            isCoach,
            AccountStatus.ACTIVATED
        );
        if (response.success) {
            setStatus(AccountStatus.ACTIVATED);
        }
    };

    const deleteUser = async (e: SyntheticEvent) => {
        e.preventDefault();
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/` +
                "admin/" +
                userId.toString(),
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            }
        )
            .then((response) => response.json())
            .catch((err) => {
                console.log(err);
            });
        if (response && response.success && notify) {
            socket.emit("disableUser"); // disable and remove user both should trigger a refresh to check if the account is still valid
            socket.emit("updateRoleUser"); // this refreshes the manage users page
            removeUser(user);
            notify(
                `Successfully removed${user.person.name}!`,
                NotificationType.SUCCESS,
                2000
            );
        } else if (response && !response.success && notify) {
            notify(
                "Something went wrong:" + response.reason,
                NotificationType.ERROR,
                2000
            );
        }
    };

    const selectEdition = async (id: number) => {
        const method = userEditions.has(id) ? "DELETE" : "POST";
        const { sessionKey } = getSession
            ? await getSession()
            : { sessionKey: "" };
        if (method === "DELETE") {
            userEditions.delete(id);
        } else {
            userEditions.add(id);
        }
        setUserEditions(new Set(userEditions));
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/year/${userId}`, {
            method: method,
            body: JSON.stringify({
                osoc_id: id,
                login_user_id: user.login_user_id,
            }),
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `auth/osoc2 ${sessionKey}`,
            },
        })
            .then(() => {
                socket.emit("yearPermissionUpdate", user.login_user_id);
            })
            .catch((reason) => {
                console.log(reason);
                if (method === "POST") {
                    userEditions.delete(id);
                } else {
                    userEditions.add(id);
                }
                setUserEditions(new Set(userEditions));
            });
    };

    return (
        <div className={styles.row}>
            <div className={styles.name}>
                <div data-testid={"userName"}>{name}</div>
                {status === AccountStatus.PENDING ? (
                    <button
                        data-testid={"pendingButton"}
                        className={styles.pending}
                        onClick={activateUser}
                    >
                        ACTIVATE
                    </button>
                ) : (
                    <div
                        className={`dropdown is-right ${
                            editionsActive ? "is-active" : "is-hoverable"
                        }`}
                    >
                        <div
                            onClick={() => setEditionsActive((prev) => !prev)}
                            className={`dropdown-trigger ${
                                editionsActive
                                    ? triangle.active
                                    : triangle.inactive
                            }`}
                        >
                            Editions
                            <div className={triangle.triangleContainer}>
                                <div className={triangle.triangle} />
                            </div>
                        </div>
                        <div className={`dropdown-menu ${styles.dropdownmenu}`}>
                            <div className="dropdown-content">
                                {editions.map((edition) => {
                                    return (
                                        <div
                                            onClick={() =>
                                                selectEdition(edition.osoc_id)
                                            }
                                            key={edition.osoc_id}
                                            className={`dropdown-item ${
                                                styles.dropdownitem
                                            }
                                            ${
                                                userEditions.has(
                                                    edition.osoc_id
                                                )
                                                    ? styles.active
                                                    : ""
                                            }`}
                                        >
                                            {edition.year}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div data-testid={"userEmail"}>{email}</div>
            <div className={styles.buttons}>
                <div
                    data-testid={"buttonIsAdmin"}
                    className={styles.buttonContainer}
                    onClick={toggleIsAdmin}
                >
                    <div className={styles.button}>
                        <Image
                            data-testid={"imageIsAdmin"}
                            className={styles.buttonImage}
                            width={30}
                            height={30}
                            src={isAdmin ? AdminIconColor : AdminIcon}
                            alt={
                                isAdmin
                                    ? "Person is an admin"
                                    : "Person is not an admin"
                            }
                        />
                    </div>
                </div>
                <div
                    data-testid={"buttonIsCoach"}
                    className={styles.buttonContainer}
                    onClick={toggleIsCoach}
                >
                    <div className={styles.button}>
                        <Image
                            data-testid={"imageIsCoach"}
                            className={styles.buttonImage}
                            src={isCoach ? CoachIconColor : CoachIcon}
                            width={30}
                            height={30}
                            alt={
                                isCoach
                                    ? "Person is a coach"
                                    : "Person is not a coach"
                            }
                        />
                    </div>
                </div>
                <div
                    data-testid={"buttonStatus"}
                    className={styles.buttonContainer}
                    onClick={toggleStatus}
                >
                    <div className={styles.button}>
                        <Image
                            data-testid={"imageStatus"}
                            className={styles.buttonImage}
                            src={
                                status === AccountStatus.DISABLED
                                    ? ForbiddenIconColor
                                    : ForbiddenIcon
                            }
                            width={30}
                            height={30}
                            alt={
                                status === AccountStatus.DISABLED
                                    ? "Person is disabled"
                                    : "Person is not disabled"
                            }
                        />
                    </div>
                </div>
            </div>
            <Modal
                handleClose={() => setShowDeleteModal(false)}
                visible={showDeleteModal}
                title={`Delete User ${name}`}
            >
                <p>
                    You are about to delete an osoc user! Deleting an osoc user
                    cannot be undone and will result in data loss. Are you
                    certain that you wish to delete osoc user {name}?
                </p>
                <button data-testid={"confirmDelete"} onClick={deleteUser}>
                    DELETE
                </button>
            </Modal>
            <button
                data-testid={"buttonDelete"}
                className={`delete ${styles.delete}`}
                onClick={() => setShowDeleteModal(true)}
            />
        </div>
    );
};
