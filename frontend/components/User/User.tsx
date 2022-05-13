import styles from "./User.module.css";
import AdminIconColor from "../../public/images/admin_icon_color.png";
import AdminIcon from "../../public/images/admin_icon.png";
import CoachIconColor from "../../public/images/coach_icon_color.png";
import CoachIcon from "../../public/images/coach_icon.png";
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png";
import ForbiddenIcon from "../../public/images/forbidden_icon.png";
import React, { SyntheticEvent, useContext, useEffect, useState } from "react";
import Image from "next/image";
import SessionContext from "../../contexts/sessionProvider";
import { AccountStatus, LoginUser } from "../../types";
import { useSockets } from "../../contexts/socketProvider";
import { Modal } from "../Modal/Modal";

export const User: React.FC<{
    user: LoginUser;
    removeUser: (user: LoginUser) => void;
}> = ({ user, removeUser }) => {
    const [name] = useState<string>(user.person_data.name);
    const [email] = useState<string>(user.person_data.email);
    const [isAdmin, setIsAdmin] = useState<boolean>(user.admin);
    const [isCoach, setIsCoach] = useState<boolean>(user.coach);
    const [status, setStatus] = useState<AccountStatus>(user.activated);
    const { getSession } = useContext(SessionContext);
    const { socket } = useSockets();
    const userId = user.login_user_id;
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // needed for when an update is received via websockets
    useEffect(() => {
        setIsAdmin(user.admin);
        setIsCoach(user.coach);
        setStatus(user.activated);
    }, [user]);

    useEffect(() => {
        if (!isAdmin && !isCoach) {
            setStatus(() => AccountStatus.DISABLED);
        }
    }, [isAdmin, isCoach]);

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
        const res = await fetch(
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
            .then(async (json) => {
                if (!json.success) {
                    return { success: false };
                } else {
                    return json;
                }
            })
            .catch((err) => {
                console.log(err);
                return { success: false };
            });
        if (res.success !== false) {
            if (changed_val === "activated") {
                socket.emit("activateUser");
            } else if (changed_val === "disabled") {
                socket.emit("disableUser");
            }
            // also emit that there has been a change in general so that the manage users screen will update
            // other changes are changes to the enum roles
            socket.emit("updateRoleUser");
        }
        return res;
    };

    const toggleIsAdmin = async (e: SyntheticEvent) => {
        e.preventDefault();
        const response = await setUserRole(
            "admin",
            "admin",
            !isAdmin,
            isCoach,
            status
        );
        if (response.success) {
            setIsAdmin((isAdmin) => !isAdmin);
            if (status === AccountStatus.DISABLED) {
                await toggleStatus(e);
            }
        }
    };

    const toggleIsCoach = async (e: SyntheticEvent) => {
        e.preventDefault();
        const response = await setUserRole(
            "coach",
            "coach",
            isAdmin,
            !isCoach,
            status
        );
        if (response.success) {
            setIsCoach((isCoach) => !isCoach);
            if (status === AccountStatus.DISABLED) {
                await toggleStatus(e);
            }
        }
    };

    const toggleStatus = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (status === AccountStatus.ACTIVATED) {
            const response = await setUserRole(
                "coach",
                "disabled", // the account is still on activated => we disable the account
                isAdmin,
                isCoach,
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
                isCoach,
                AccountStatus.ACTIVATED
            );
            if (response && response.success) {
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
            .then(async (json) => {
                if (!json.success) {
                    return { success: false };
                }
                socket.emit("disableUser"); // disable and remove user both should trigger a refresh to check if the account is still valid
                socket.emit("updateRoleUser"); // this refreshes the manage users page
                removeUser(user);
                return json;
            })
            .catch((err) => {
                console.log(err);
                return { success: false };
            });
        if (response.success) {
            removeUser(user);
            return response;
        } else {
            return { success: false };
        }
    };

    return (
        <div className={styles.row}>
            <div className={styles.name}>
                <p data-testid={"userName"}>{name}</p>
                {status === AccountStatus.PENDING ? (
                    <button
                        data-testid={"pendingButton"}
                        className={styles.pending}
                        onClick={activateUser}
                    >
                        ACTIVATE
                    </button>
                ) : null}
            </div>

            <p data-testid={"userEmail"}>{email}</p>
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
                <button onClick={deleteUser}>DELETE</button>
            </Modal>
            <button
                data-testid={"buttonDelete"}
                className={`delete ${styles.delete}`}
                onClick={() => setShowDeleteModal(true)}
            />
        </div>
    );
};
