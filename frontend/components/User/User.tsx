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


export const User: React.FC<{ user: LoginUser }> = ({user}) => {

    const [name] = useState<string>(user.person.firstname);
    const [email] = useState<string>(user.person.email);
    const [isAdmin, setIsAdmin] = useState<boolean>(user.is_admin);
    const [isCoach, setIsCoach] = useState<boolean>(user.is_coach);
    const [status, setStatus] = useState<string>(user.account_status);
    const {sessionKey, setSessionKey} = useContext(SessionContext);
    const userId = user.login_user_id;

    const reverseRole = (changed_val: string) => {
        if (changed_val === "admin") {
            setIsAdmin(admin => !admin);
        } else if (changed_val === "coach") {
            setIsCoach(isCoach => !isCoach);
        } else if (changed_val === "activated") {
            //TODO This doesn't work because setStatus is an async function(need to find a way to revert it).
            setStatus(revertStatus())
        }
    }
    const revertStatus = () => {
        if (status === "ACTIVATED") {
            return 'DISABLED';
        } else {
            return 'ACTIVATED';
        }
    }
    const setUserRole = async (route: string, changed_val: string) => {
        console.log(`${process.env.NEXT_PUBLIC_API_URL}/` + route + "/" + userId.toString())
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/` + route + "/" + userId.toString(), {
            method: 'POST',
            body: JSON.stringify({isCoach: isCoach, isAdmin: isAdmin, accountStatus: status}),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `auth/osoc2 ${sessionKey}`
            }
        })
            .then(response => response.json()).then(async json => {
                if (!json.success) {
                    reverseRole(changed_val);
                    return {success: false};
                } else {
                    console.log(json)
                    if (setSessionKey) {
                        setSessionKey(json.sessionkey)
                    }
                    return json;
                }
            })
            .catch(err => {
                console.log(err);
                reverseRole(changed_val);
                return {success: false};
            })
    }

    const toggleIsAdmin = async (e: SyntheticEvent) => {
        e.preventDefault();
        setIsAdmin(!isAdmin);
        const z = await setUserRole("admin", "admin");
        console.log(z)
        console.log("aeihgaoih")
    }

    const toggleIsCoach = async (e: SyntheticEvent) => {
        e.preventDefault();
        setIsCoach(!isCoach);
        await setUserRole("coach", "coach");
    }

    const toggleStatus = async (e: SyntheticEvent) => {
        e.preventDefault();
        if (status === AccountStatus.ACTIVATED) {
            setStatus(AccountStatus.DISABLED);
        } else if (status === AccountStatus.DISABLED) {
            setStatus(AccountStatus.ACTIVATED);
        }
        await setUserRole("coach", "activated");
    }

    const activateUser = async (e: SyntheticEvent) => {
        e.preventDefault();
        setStatus(AccountStatus.ACTIVATED);
        // TODO -- Send the status value to the backend
        //      -- If error revert to old value
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
            </div>
        </div>)
}
