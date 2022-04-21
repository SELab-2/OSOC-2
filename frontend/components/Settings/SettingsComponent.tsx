import React, { useContext, useState } from "react";
import styles from "./Settings.module.scss";
import { LoginUser } from "../../types/types";
import SessionContext from "../../contexts/sessionProvider";

export const SettingsComponent: React.FC<{
    person: LoginUser;
    setUser: (user: LoginUser) => void;
}> = ({ person, setUser }) => {
    const [newName, setNewName] = useState<string>("");
    const [currPassword, setCurrPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const { getSessionKey, setSessionKey } = useContext(SessionContext);

    console.log(newName);
    console.log(currPassword);
    console.log(newPassword);

    const changeUser = async (body: unknown) => {
        let path = "coach";
        const sessionKey =
            getSessionKey != undefined ? await getSessionKey() : "";
        if (person.is_admin) {
            path = "admin";
        }
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/` + path + person.login_user_id,
            {
                method: "POST",
                body: body,
                headers: {
                    Authorization: `auth/osoc2 ${sessionKey}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }
        )
            .then((response) => response.json())
            .catch((err) => {
                console.log(err);
            });
        if (setSessionKey && response && response.sessionkey) {
            setSessionKey(response.sessionkey);
        }
        return response;
    };
    const changeName = async () => {
        const body = {};
        const response = await changeUser(body);
        return response;
    };
    console.log(changeName);
    console.log(setUser);
    return (
        <div className={styles.settings}>
            <text>current name: {person.person.firstname}</text>
            <br />
            <text>new name</text>
            <input onChange={(e) => setNewName(e.target.value)} />
            <button>Change name</button>

            <text>current password</text>
            <input onChange={(e) => setCurrPassword(e.target.value)} />
            <text>new password</text>
            <input onChange={(e) => setNewPassword(e.target.value)} />
            <button>Change password</button>
        </div>
    );
};
