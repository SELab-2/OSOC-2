import React, { SyntheticEvent, useContext, useState } from "react";
import { LoginUser } from "../../types";
import SessionContext from "../../contexts/sessionProvider";
import styles from "../../styles/login.module.scss";
import isStrongPassword from "validator/lib/isStrongPassword";

export const Settings: React.FC<{
    person: LoginUser;
    fetchUser: () => void;
}> = ({ person, fetchUser }) => {
    const [newName, setNewName] = useState<string>("");
    const [currPassword, setCurrPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [retypePassword, setRetypePassword] = useState<string>("");
    const [currPasswordError, setCurrPasswordError] = useState<string>("");
    const [newPasswordError, setNewPasswordError] = useState<string>("");
    const [newPasswordScore, setNewPasswordScore] = useState<number>(0);
    const [applyError, setApplyError] = useState<string>("");
    const { getSession, setSessionKey } = useContext(SessionContext);

    /**
     * Gets called everytime the new password input field's value changes
     * Calculates the password score and set the corresponding error messages
     * @param password
     */
    const updateNewPassword = (password: string) => {
        const score = isStrongPassword(password, {
            returnScore: true,
        }) as unknown as number;
        setNewPasswordScore(score);
        setNewPasswordError("");
        setNewPassword(password);
    };

    const updateRetypePass = (password: string) => {
        setRetypePassword(password);
    };

    /**
     * Converts the register password strength score to a textual representation
     */
    const scoreToText = () => {
        if (newPasswordScore < 20) {
            return "Weak";
        }

        if (newPasswordScore < 40) {
            return "Moderate";
        }

        return "Strong";
    };

    /**
     * Returns a style for the current password strength
     */
    const scoreToStyle = () => {
        if (newPasswordScore < 20) {
            return styles.weak;
        }

        if (newPasswordScore < 40) {
            return styles.moderate;
        }

        return styles.strong;
    };

    const changeUser = async (e: SyntheticEvent) => {
        e.preventDefault();
        // Some initial text field checks
        let error = false;
        if (currPassword === "" && newPassword !== "") {
            setCurrPasswordError("Please provide your current password");
            error = true;
        } else {
            setCurrPasswordError("");
        }

        if (currPassword !== "" && newPassword === "") {
            setNewPasswordError("New password cannot be empty");
            error = true;
        } else if (currPassword !== "" && newPasswordScore < 20) {
            setNewPasswordError("Please provide a secure enough password");
            error = true;
        } else if (newPassword !== retypePassword) {
            setNewPasswordError("Passwords do not match");
            error = true;
        } else {
            setNewPasswordError("");
        }

        if (error) {
            return;
        }

        if (currPassword === "" && newPassword === "" && newName === "") {
            setApplyError("No input was given");
            return;
        } else {
            setApplyError("");
        }

        // We dynamically build the body
        const body: Record<string, unknown> = {};
        if (newName !== "") {
            body.name = newName;
        }

        if (currPassword !== "" && newPassword !== "") {
            body.pass = {
                oldpass: currPassword,
                newpass: newPassword,
            };
        }

        if (body !== {}) {
            const { sessionKey } = getSession
                ? await getSession()
                : { sessionKey: "" };
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
                    setApplyError(
                        "Something went wrong while trying to execute your request."
                    );
                    console.log(err);
                });
            if (response !== undefined) {
                if (response.success) {
                    if (setSessionKey) {
                        setSessionKey(response.sessionkey);
                    }
                    fetchUser();
                    // TODO notify succes
                } else {
                    setApplyError(
                        `Failed to apply changes. Please check all fields. ${response.reason}`
                    );
                }
            }
        }
    };

    return (
        <div className={styles.body}>
            <form className={styles.form}>
                <label data-testid={"personName"} className={styles.label}>
                    Current Name: {person.person_data.name}
                </label>
                <label data-testid={"labelNewName"} className={styles.label}>
                    New Name
                    <input
                        data-testid={"inputNewName"}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                </label>

                <label
                    data-testid={"labelCurrentPassword"}
                    className={styles.label}
                >
                    Current Password
                    <input
                        data-testid={"inputCurrentPassword"}
                        type="password"
                        onChange={(e) => setCurrPassword(e.target.value)}
                    />
                </label>
                <p
                    data-testid={"errorCurrPass"}
                    className={`${styles.textFieldError} ${
                        currPasswordError !== "" ? styles.anim : ""
                    }`}
                >
                    {currPasswordError}
                </p>

                <label
                    data-testid={"labelNewPassword"}
                    className={styles.label}
                >
                    New Password
                    <input
                        data-testid={"inputNewPassword"}
                        type="password"
                        onChange={(e) => updateNewPassword(e.target.value)}
                    />
                </label>
                {newPasswordError === "" && newPassword !== "" ? (
                    <div
                        className={styles.anim}
                        style={{
                            display: "inherit",
                            justifyContent: "space-between",
                        }}
                    >
                        <p
                            className={`${
                                styles.textFieldError
                            } ${scoreToStyle()}`}
                        >
                            Password strength:
                        </p>
                        <p
                            data-testid={"newPassScoreError"}
                            className={`${
                                styles.textFieldError
                            } ${scoreToStyle()}`}
                        >
                            {scoreToText()}
                        </p>
                    </div>
                ) : (
                    <p
                        data-testid={"newPassError"}
                        className={`${styles.textFieldError} ${
                            newPasswordError !== "" ? styles.anim : ""
                        }`}
                    >
                        {newPasswordError}
                    </p>
                )}
                <label
                    data-testid={"labelRetypeNewPassword"}
                    className={styles.label}
                >
                    Retype New Password
                    <input
                        data-testid={"inputRetypeNewPassword"}
                        type="password"
                        onChange={(e) => updateRetypePass(e.target.value)}
                    />
                </label>
                <button data-testid={"confirmButton"} onClick={changeUser}>
                    Apply Changes
                </button>
                <p
                    data-testid={"pErrorPassword"}
                    className={`${styles.textFieldError} ${
                        applyError !== "" ? styles.anim : ""
                    }`}
                >
                    {applyError}
                </p>
            </form>
        </div>
    );
};
