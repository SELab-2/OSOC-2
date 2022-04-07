import {NextPage} from "next";
import {useRouter} from "next/router";
import {Header} from "../../components/Header/Header";
import styles from "../../styles/login.module.scss";
import {SyntheticEvent, useEffect, useState} from "react";
import crypto from "crypto";

/**
 * Landing page for when you click the reset password link from your email
 * Being of form /reset/resetID
 * @constructor
 */
const Pid: NextPage = () => {

    const router = useRouter()
    const {pid} = router.query // pid is the session key

    const [newPassword, setNewPassword] = useState<string>("");
    const [newPasswordError, setNewPasswordError] = useState<string>("");
    const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
    const [confirmNewPasswordError, setConfirmNewPasswordError] = useState<string>("");
    const [backendError, setBackendError] = useState<string>("");


    /**
     * Check if the provided code is a valid code
     */
    useEffect(() => {
        if (pid !== undefined) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset/${pid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'applicatin'
                }
            }).then(response => {
                // The code is not valid
                if (!response.ok) {
                    router.push("/reset").then()
                }
            })
        }
    }, [pid, router])

    /**
     * Handles all the logic for resetting the password
     * @param e
     */
    const resetPassword = async (e: SyntheticEvent) => {
        e.preventDefault()
        let error = false
        if (newPassword === "") {
            setNewPasswordError("Password cannot be empty")
            error = true
        } else {
            setNewPasswordError("")
        }

        if (confirmNewPassword != newPassword) {
            setConfirmNewPasswordError("Passwords do not match")
            error = true
        } else if (confirmNewPassword === "") {
            setConfirmNewPasswordError("Please confirm your new password")
            error = true
        } else {
            setConfirmNewPasswordError("")
        }

        if (!error) {
            // We encrypt the password before sending it to the backend api
            const encryptedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset/${pid}`, {
                method: 'POST',
                body: JSON.stringify({password: encryptedPassword}),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            }).then(response => response.json()).catch(error => console.log(error))
            if (response.success) {
                setBackendError("")
                // TODO -- Notification
                router.push("/login").then()
            } else {
                setBackendError(response.reason)
            }
        }
    }

    return <>
        <Header/>
        <div style={{width: "clamp(18rem, 80vw, 30rem)", marginInline: "auto"}}>
            <h2>Reset Password</h2>
            <form className={styles.form}>
                <label className={styles.label}>
                    New Password
                    <input type="password" name="newPassword" value={newPassword}
                           onChange={e => setNewPassword(e.target.value)}/>
                </label>
                <p className={`${styles.textFieldError} ${newPasswordError !== "" ? styles.anim : ""}`}>{newPasswordError}</p>
                <label className={styles.label}>
                    Confirm New Password
                    <input type="password" name="confirmNewPassword" value={confirmNewPassword}
                           onChange={e => setConfirmNewPassword(e.target.value)}/>
                </label>
                <p className={`${styles.textFieldError} ${confirmNewPasswordError !== "" ? styles.anim : ""}`}>{confirmNewPasswordError}</p>
                <button onClick={e => resetPassword(e)}>RESET PASSWORD</button>
                <p className={`${styles.textFieldError} ${backendError !== "" ? styles.anim : ""}`}>{backendError}</p>
            </form>
        </div>
    </>
}

export default Pid;
