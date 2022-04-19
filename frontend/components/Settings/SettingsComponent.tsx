import React from "react";
import styles from "./Settings.module.scss";
import { LoginUser } from "../../types/types";

export const SettingsComponent: React.FC<{
    person: LoginUser;
    setUser: (user: LoginUser) => void;
}> = ({ person, setUser }) => {
    console.log(setUser);
    return (
        <div className={styles.settings}>
            <text>current name: {person.person.firstname}</text>
            <br />
            <text>new name</text>
            <input />
            <button>Change name</button>

            <text>current password</text>
            <input />
            <text>new password</text>
            <input />
            <button>Change password</button>
        </div>
    );
};
