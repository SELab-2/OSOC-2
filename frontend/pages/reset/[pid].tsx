import { NextPage } from "next";
import { useRouter } from "next/router";
import styles from "../../styles/login.module.scss";
import { SyntheticEvent, useEffect, useState } from "react";
import isStrongPassword from "validator/lib/isStrongPassword";

/**
 * Landing page for when you click the reset password link from your email
 * Being of form /reset/resetID
 * @constructor
 */
const Pid: NextPage = () => {
    const router = useRouter();
    const { pid } = router.query; // pid is the session key

    const [newPassword, setNewPassword] = useState<string>("");
    const [newPasswordError, setNewPasswordError] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
    const [confirmNewPasswordError, setConfirmNewPasswordError] =
        useState<string>("");
    const [newPasswordScore, setNewPasswordScore] = useState<number>(0);
    const [backendError, setBackendError] = useState<string>("");

    /**
     * Check if the provided code is a valid code
     */
    useEffect(() => {
        if (pid !== undefined) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset/${pid}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            }).then((response) => {
                // The code is not valid
                if (!response.ok) {
                    router.push("/reset").then();
                }
            });
        }
    }, [pid, router]);

    const updateNewPassword = (password: string) => {
        const score = isStrongPassword(password, {
            returnScore: true,
        }) as unknown as number;
        setNewPasswordScore(score);
        setNewPasswordError("");
        setNewPassword(password);
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

    /**
     * Handles all the logic for resetting the password
     * @param e
     */
    const resetPassword = async (e: SyntheticEvent) => {
        e.preventDefault();
        let error = false;
        if (newPassword === "") {
            setNewPasswordError("Password cannot be empty");
            error = true;
        } else if (newPasswordScore < 20) {
            setNewPasswordError("Please provide a secure enough password");
            error = true;
        } else {
            setNewPasswordError("");
        }

        if (confirmNewPassword != newPassword) {
            setConfirmNewPasswordError("Passwords do not match");
            error = true;
        } else if (confirmNewPassword === "") {
            setConfirmNewPasswordError("Please confirm your new password");
            error = true;
        } else {
            setConfirmNewPasswordError("");
        }

        if (!error) {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/reset/${pid}`,
                {
                    method: "POST",
                    body: JSON.stringify({ password: newPassword }),
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            )
                .then((response) => response.json())
                .catch((error) => console.log(error));
            if (response.success) {
                setBackendError("");
                // TODO -- Notification
                router.push("/login").then();
            } else {
                setBackendError(response.reason);
            }
        }
    };

    return (
        <div
            style={{ width: "clamp(18rem, 80vw, 30rem)", marginInline: "auto" }}
        >
            <h2>Reset Password</h2>
            <form className={styles.form}>
                <label className={styles.label}>
                    New Password
                    <input
                        type="password"
                        name="newPassword"
                        value={newPassword}
                        onChange={(e) => updateNewPassword(e.target.value)}
                    />
                </label>
                {newPasswordError === "" && newPassword !== "" ? (
                    <div
                        className={styles.anim}
                        style={{
                            justifyContent: "space-between",
                            display: "inherit",
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
                            className={`${
                                styles.textFieldError
                            } ${scoreToStyle()}`}
                        >
                            {scoreToText()}
                        </p>
                    </div>
                ) : (
                    <p
                        className={`${styles.textFieldError} ${
                            newPasswordError !== "" ? styles.anim : ""
                        }`}
                    >
                        {newPasswordError}
                    </p>
                )}
                <label className={styles.label}>
                    Confirm New Password
                    <input
                        type="password"
                        name="confirmNewPassword"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                </label>
                <p
                    className={`${styles.textFieldError} ${
                        confirmNewPasswordError !== "" ? styles.anim : ""
                    }`}
                >
                    {confirmNewPasswordError}
                </p>
                <button onClick={(e) => resetPassword(e)}>
                    RESET PASSWORD
                </button>
                <p
                    className={`${styles.textFieldError} ${
                        backendError !== "" ? styles.anim : ""
                    }`}
                >
                    {backendError}
                </p>
            </form>
        </div>
    );
};

export default Pid;
