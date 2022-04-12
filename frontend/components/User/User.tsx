import styles from "./User.module.css";
import AdminIconColor from "../../public/images/admin_icon_color.png";
import AdminIcon from "../../public/images/admin_icon.png"
import CoachIconColor from "../../public/images/coach_icon_color.png"
import CoachIcon from "../../public/images/coach_icon.png";
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png"
import ForbiddenIcon from "../../public/images/forbidden_icon.png"
import React, {SyntheticEvent, useContext, useState} from "react";
import Image from "next/image";
import SessionContext from "../../contexts/sessionProvider";
import {AccountStatus, LoginUser} from "../../types/types";


export const User: React.FC<{ user: LoginUser, removeUser: (user: LoginUser) => void }> = ({user, removeUser}) => {

    const [name] = useState<string>(user.person.firstname);
    const [email] = useState<string>(user.person.email);
    const [isAdmin, setIsAdmin] = useState<boolean>(user.is_admin);
    const [isCoach, setIsCoach] = useState<boolean>(user.is_coach);
    const [status, setStatus] = useState<AccountStatus>(user.account_status);
    const {sessionKey, setSessionKey} = useContext(SessionContext);
    const userId = user.login_user_id;

    const reverseRole = (changed_val: string, status_enum: AccountStatus) => {
        if (changed_val === "admin") {
            setIsAdmin(admin => !admin);
        } else if (changed_val === "coach") {
            setIsCoach(isCoach => !isCoach);
        } else if (changed_val === "enum") {
            setStatus(status_enum)
        }
    }

    const setUserRole = async (route: string, changed_val: string, admin_bool: boolean, coach_bool: boolean, status_enum: AccountStatus
        , original_status_enum: AccountStatus) => {
        console.log(`${process.env.NEXT_PUBLIC_API_URL}/` + route + "/" + userId.toString())

        const json_body = JSON.stringify({isCoach: coach_bool, isAdmin: admin_bool, accountStatus: status_enum})
        console.log(json_body)
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/` + route + "/" + userId.toString(), {
            method: 'POST',
            body: json_body,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `auth/osoc2 ${sessionKey}`
            }
        })
            .then(response => response.json()).then(async json => {
                if (!json.success) {
                    reverseRole(changed_val, original_status_enum);
                    return {success: false};
                } else {
                    if (setSessionKey) {
                        setSessionKey(json.sessionkey)
                    }
                    return json;
                }
            })
            .catch(err => {
                console.log(err);
                reverseRole(changed_val, original_status_enum);
                return {success: false};
            })
    }

    const toggleIsAdmin = async (e: SyntheticEvent) => {
        e.preventDefault();
        setIsAdmin(!isAdmin);
        await setUserRole("admin", "admin", !isAdmin, isCoach, status, status);
    }

    const toggleIsCoach = async (e: SyntheticEvent) => {
        e.preventDefault();
        setIsCoach(!isCoach);
        await setUserRole("coach", "coach", isAdmin, !isCoach, status, status);
    }

    const toggleStatus = async (e: SyntheticEvent) => {
        e.preventDefault();
        let temp_stat = AccountStatus.ACTIVATED
        if (status === AccountStatus.ACTIVATED) {
            setStatus(AccountStatus.DISABLED);
            temp_stat = AccountStatus.DISABLED;
        } else if (status === AccountStatus.DISABLED) {
            setStatus(AccountStatus.ACTIVATED);
            temp_stat = AccountStatus.ACTIVATED
        }
        await setUserRole("coach", "activated", isAdmin, isCoach, temp_stat, status);
    }

    const activateUser = async (e: SyntheticEvent) => {
        e.preventDefault();
        setStatus(AccountStatus.ACTIVATED);
        setUserRole("coach", "enum", isAdmin, isCoach, AccountStatus.ACTIVATED, AccountStatus.PENDING)
    }

    const deleteUser = async (e: SyntheticEvent) => {
        e.preventDefault();
        removeUser(user)

    }

    return (
        <div className={styles.row}>
            <div className={styles.name}>
                <p>{name}</p>
                {status === AccountStatus.PENDING ?
                    <button className={styles.pending} onClick={activateUser}>ACTIVATE</button> : null}
            </div>

            <p>{email}</p>
            <div className={styles.buttons}>
                <div className={styles.buttonContainer} onClick={toggleIsAdmin}>
                    <div className={styles.button}>
                        <Image className={styles.buttonImage} width={30} height={30}
                               src={isAdmin ? AdminIconColor : AdminIcon}
                               alt={"Admin"}/>
                    </div>
                </div>
                <div className={styles.buttonContainer} onClick={toggleIsCoach}>
                    <div className={styles.button}>
                        <Image className={styles.buttonImage} src={isCoach ? CoachIconColor : CoachIcon} width={30}
                               height={30}
                               alt={"Coach"}/>
                    </div>
                </div>
                <div className={styles.buttonContainer} onClick={toggleStatus}>
                    <div className={styles.button}>
                        <Image className={styles.buttonImage}
                               src={status === AccountStatus.DISABLED ? ForbiddenIconColor : ForbiddenIcon}
                               width={30} height={30} alt={"Disabled"}/>
                    </div>
                </div>
                <div className={styles.buttonContainer} onClick={deleteUser}>
                    <div className={styles.button}>
                        <Image className={styles.buttonImage}
                               src={ForbiddenIconColor}
                               width={30} height={30} alt={"Disabled"}/>
                    </div>
                </div>

            </div>
        </div>)
}
