import styles from "./User.module.css";
import AdminIconColor from "../../public/images/admin_icon_color.png";
import AdminIcon from "../../public/images/admin_icon.png"
import CoachIconColor from "../../public/images/coach_icon_color.png"
import CoachIcon from "../../public/images/coach_icon.png";
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png"
import ForbiddenIcon from "../../public/images/forbidden_icon.png"
import GreenCheckMark from "../../public/images/green_check_mark.png"
import React, {SyntheticEvent, useState} from "react";
import Image from "next/image";


export const User: React.FC<{ userName: string, userEmail: string, userIsAdmin: boolean, userIsCoach: boolean, userStatus: string }> = ({
                                                                                                                                            userName,
                                                                                                                                            userEmail,
                                                                                                                                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                                                                                                            userIsAdmin,
                                                                                                                                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                                                                                                            userIsCoach,
                                                                                                                                            userStatus
                                                                                                                                        }) => {

    const [name] = useState<string>(userName)
    const [email] = useState<string>(userEmail)
    const [isAdmin, setIsAdmin] = useState<boolean>(userIsAdmin)
    const [isCoach, setIsCoach] = useState<boolean>(userIsCoach)
    const [status, setStatus] = useState<string>(userStatus)

    const toggleIsAdmin = async (e: SyntheticEvent) => {
        e.preventDefault()
        setIsAdmin(!isAdmin)
        // TODO -- Send the isAdmin value to the backend
        //      -- If error revert to old value
    }

    const toggleIsCoach = async (e: SyntheticEvent) => {
        e.preventDefault()
        setIsCoach(!isCoach)
        // TODO -- Send the isCoach value to the backend
        //      -- If error revert to old value
    }

    const toggleStatus = async (e: SyntheticEvent) => {
        e.preventDefault()
        if (status == 'ACTIVATED') {
            setStatus('DISABLED')
        } else {
            setStatus('ACTIVATED')
        }
        // TODO -- Send the status value to the backend
        //      -- If error revert to old value
    }

    const activateUser = async (e: SyntheticEvent) => {
        e.preventDefault()
        setStatus('ACTIVATED')
        // TODO -- Send the status value to the backend
        //      -- If error revert to old value
    }

    return (
        <div className={styles.row}>
            <p>{name}</p>
            <p>{email}</p>
            <div className={styles.buttons}>
                <div className={styles.buttonContainer} onClick={toggleIsAdmin}>
                    <div className={styles.button}>
                        <Image className={styles.buttonImage} width={30} height={30}
                               src={isAdmin ? AdminIconColor : AdminIcon}
                               alt={"Admin"}/>
                    </div>
                    <p>Admin</p>
                </div>
                <div className={styles.buttonContainer} onClick={toggleIsCoach}>
                    <div className={styles.button}>
                        <Image className={styles.buttonImage} src={isCoach ? CoachIconColor : CoachIcon} width={30}
                               height={30}
                               alt={"Coach"}/>
                    </div>
                    <p>Coach</p>
                </div>
                {status === 'PENDING' ?
                    <div className={styles.buttonContainer} onClick={activateUser}>
                        <div className={styles.button}>
                            <Image className={styles.buttonImage}
                                   src={GreenCheckMark}
                                   width={30} height={30} alt={"Disabled"}/>
                        </div>
                        <p style={{fontWeight: 'bold'}}>Pending</p>
                    </div>
                    :
                    <div className={styles.buttonContainer} onClick={toggleStatus}>
                        <div className={styles.button}>
                            <Image className={styles.buttonImage}
                                   src={status === 'DISABLED' ? ForbiddenIconColor : ForbiddenIcon}
                                   width={30} height={30} alt={"Disabled"}/>
                        </div>
                        <p>Disabled</p>
                    </div>}
            </div>
        </div>)
}
