import styles from "./User.module.css";
import AdminIcon from "../../public/images/admin_icon.png";
import AdminIconColor from "../../public/images/admin_icon_color.png";
import CoachIcon from "../../public/images/coach_icon.png";
import CoachIconColor from "../../public/images/coach_icon_color.png";
import ForbiddenIcon from "../../public/images/forbidden_icon.png";
import ForbiddenIconColor from "../../public/images/forbidden_icon_color.png";
import {UserButton} from "../UserButton/UserButton";
import React from "react";


export const User: React.FC = () => {
    return (
        <div className={styles.row}>
            <div className={styles.column}>
                <p>name <b>[Status pending]</b></p>
            </div>
            <div className={styles.column}>
                <p>email</p>
            </div>
            <div className={styles.column}>
                {UserButton(AdminIcon, AdminIconColor, "admin")}
                {UserButton(CoachIcon, CoachIconColor, "coach")}
                {UserButton(ForbiddenIcon, ForbiddenIconColor, "admin")}

            </div>
        </div>)
}
