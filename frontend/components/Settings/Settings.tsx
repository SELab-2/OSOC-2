import React, { useContext, useState } from "react";
import { LoginUser } from "../../types";
import SessionContext from "../../contexts/sessionProvider";
import crypto from "crypto";

export const Settings: React.FC<{
    person: LoginUser;
    fetchUser: () => void;
}> = (person, fetchUser) => {
    const [newName, setNewName] = useState<string>("");
    const [currPassword, setCurrPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const { getSessionKey } = useContext(SessionContext);

    const changeUser = async () => {
        const sessionKey =
            getSessionKey != undefined ? await getSessionKey() : "";
        const encryptedOldPassword = crypto
            .createHash("sha256")
            .update(currPassword)
            .digest("hex");
        const encryptedNewPassword = crypto
            .createHash("sha256")
            .update(newPassword)
            .digest("hex");

        // We dynamically build the body
        const body: Record<string, unknown> = {};
        if (newName !== "") {
            body.name = newName;
        }

        if (currPassword !== "" && newPassword !== "") {
            body.pass = {
                oldpass: encryptedOldPassword,
                newpass: encryptedNewPassword,
            };
        }

        if (body !== {}) {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/user/self`,
                {
                    method: "POST",
                    body: JSON.stringify(body),
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
            if (response !== undefined && response.succes) {
                console.log(response);
            }
            fetchUser();
        }
    };

    return (
        <div>
            <text>current name: {person.person.person.firstname}</text>
            <br />
            <text>new name</text>
            <input onChange={(e) => setNewName(e.target.value)} />

            <text>current password</text>
            <input onChange={(e) => setCurrPassword(e.target.value)} />
            <text>new password</text>
            <input onChange={(e) => setNewPassword(e.target.value)} />
            <button onClick={changeUser}>Apply changes</button>
        </div>
    );
};
