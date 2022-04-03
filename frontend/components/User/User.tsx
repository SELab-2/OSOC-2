import styles from "./User.module.css";
import AdminIconColor from "../../public/images/admin_icon_color.png";
import AdminIcon from "../../public/images/admin_icon.png"
import CoachIconColor from "../../public/images/coach_icon_color.png"
import CoachIcon from "../../public/images/coach_icon.png";
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png"
import ForbiddenIcon from "../../public/images/forbidden_icon.png"
import React, {useState} from "react";
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
    const [isAdmin] = useState<boolean>(userIsAdmin)
    const [isCoach] = useState<boolean>(userIsCoach)
    const [status] = useState<string>(userStatus)

    // TODO -- Create a function for every button

    return (
        <div className={styles.row}>
            <p>{name}</p>
            <p>{email}</p>
            <div className={styles.buttons}>
                <div className={styles.buttonContainer}>
                    <div className={styles.button}>
                        <Image className={styles.buttonImage} width={30} height={30}
                               src={isAdmin ? AdminIconColor : AdminIcon}
                               alt={"Admin"}/>
                    </div>
                    <p>Admin</p>
                </div>
                <div className={styles.buttonContainer}>
                    <div className={styles.button}>
                        <Image className={styles.buttonImage} src={isCoach ? CoachIconColor : CoachIcon} width={30}
                               height={30}
                               alt={"Coach"}/>
                    </div>
                    <p>Coach</p>
                </div>
                <div className={styles.buttonContainer}>
                    <div className={styles.button}>
                        <Image className={styles.buttonImage}
                               src={status === 'DISABLED' ? ForbiddenIconColor : ForbiddenIcon}
                               width={30} height={30} alt={"Disabled"}/>
                    </div>
                    <p>Disabled</p>
                </div>
            </div>
        </div>)
}
