import styles from "./User.module.css";
import AdminIcon from "../../public/images/admin_icon.png";
import AdminIconColor from "../../public/images/admin_icon_color.png";
import CoachIcon from "../../public/images/coach_icon.png";
import CoachIconColor from "../../public/images/coach_icon_color.png";
import ForbiddenIcon from "../../public/images/forbidden_icon.png";
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png";
import {UserButton} from "../UserButton/UserButton";
import React from "react";


export const User: React.FC<{ name: string, email: string, is_coach: boolean, is_admin: boolean }> = ({
                                                                                                          name,
                                                                                                          email,
                                                                                                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                                                                          is_coach,
                                                                                                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                                                                          is_admin
                                                                                                      }) => {
    return (
        <div className={styles.row}>
            <div className={styles.column}>
                <p>{name}</p>
            </div>
            <div className={styles.column}>
                <p>{email}</p>
            </div>
            <div className={styles.column}>
                {UserButton(AdminIcon, AdminIconColor, "admin")}
                {UserButton(CoachIcon, CoachIconColor, "coach")}
                {UserButton(ForbiddenIcon, ForbiddenIconColor, "admin")}
            </div>
        </div>)
}
