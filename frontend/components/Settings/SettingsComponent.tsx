import React, { useContext, useState } from "react";
import styles from "./Settings.module.scss";
import { LoginUser } from "../../types/types";
import SessionContext from "../../contexts/sessionProvider";
import crypto from "crypto";

export const SettingsComponent: React.FC<{
    person: LoginUser;
    fetchUser: () => void;
}> = ({ person, fetchUser }) => {
    const [newName, setNewName] = useState<string>("");
    const [currPassword, setCurrPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const { getSessionKey, setSessionKey } = useContext(SessionContext);

    const changeUser = async () => {
        const sessionKey =
            getSessionKey != undefined ? await getSessionKey() : "";
        let body = "";
        const encryptedOldPassword = crypto
            .createHash("sha256")
            .update(currPassword)
            .digest("hex");
        const encryptedNewPassword = crypto
            .createHash("sha256")
            .update(newPassword)
            .digest("hex");
        if (newName !== "" && (currPassword === "" || newPassword === "")) {
            body = JSON.stringify({ name: newName });
        } else if (
            newName === "" &&
            currPassword !== "" &&
            newPassword !== ""
        ) {
            body = JSON.stringify({
                pass: {
                    oldpass: encryptedOldPassword,
                    newpass: encryptedNewPassword,
                },
            });
        } else if (
            newName !== "" &&
            currPassword !== "" &&
            newPassword !== ""
        ) {
            body = JSON.stringify({
                name: newName,
                pass: {
                    oldpass: encryptedOldPassword,
                    newpass: encryptedNewPassword,
                },
            });
        }

        if (body !== "") {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/user/self`,
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
            fetchUser();
        }
    };

    return (
        <div className={styles.settings}>
            <text>current name: {person.person.firstname}</text>
            <br />
            <text>new name</text>
            <input onChange={(e) => setNewName(e.target.value)} />

            <text>current password</text>
            <input onChange={(e) => setCurrPassword(e.target.value)} />
            <text>new password</text>
            <input onChange={(e) => setNewPassword(e.target.value)} />
            <button onClick={changeUser}>Apply changes</button>
            <button>Delete user</button>
        </div>
    );
};
