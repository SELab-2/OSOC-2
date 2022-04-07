import type {NextPage} from 'next'
import styles from '../../styles/login.module.scss'
import Image from "next/image"
import GitHubLogo from "../../public/images/github-logo.svg"
import {SyntheticEvent, useContext, useEffect, useState} from "react";
import {Modal} from "../../components/Modal/Modal";
import {useRouter} from "next/router";
import {Header} from "../../components/Header/Header";

import * as crypto from 'crypto';
import SessionContext from "../../contexts/sessionProvider";

const Index: NextPage = () => {

    const router = useRouter()
    const {getSessionKey, setSessionKey, setIsAdmin, setIsCoach} = useContext(SessionContext)

    // Sets an error message when the `loginError` query paramater is present
    useEffect(() => {
        let sessionKey = ""
        if (getSessionKey) {
            sessionKey = getSessionKey()
        }
        // The user is already logged in, redirect the user
        if (sessionKey != "") {
            router.push("/students").then()
            return
        }

        const {loginError} = router.query
        if (loginError != undefined) {
            if (typeof loginError === 'string') {
                setLoginBackendError(loginError)
            }
        }
    }, [getSessionKey, router, router.query])

    // Index field values with corresponding error messages
    const [loginEmail, setLoginEmail] = useState<string>("");
    const [loginEmailError, setLoginEmailError] = useState<string>("");
    const [loginPassword, setLoginPassword] = useState<string>("");
    const [loginPasswordError, setLoginPasswordError] = useState<string>("");
    const [loginBackendError, setLoginBackendError] = useState<string>("");

    // Register field values with corresponding error messages
    const [registerEmail, setRegisterEmail] = useState<string>("");
    const [registerEmailError, setRegisterEmailError] = useState<string>("");
    const [registerFirstName, setRegisterFirstName] = useState<string>("");
    const [registerFirstNameError, setRegisterFirstNameError] = useState<string>("");
    const [registerLastName, setRegisterLastName] = useState<string>("");
    const [registerLastNameError, setRegisterLastNameError] = useState<string>("");
    const [registerPassword, setRegisterPassword] = useState<string>("");
    const [registerPasswordError, setRegisterPasswordError] = useState<string>("");
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState<string>("");
    const [registerConfirmPasswordError, setRegisterConfirmPasswordError] = useState<string>("");
    const [registerBackendError, setRegisterBackendError] = useState<string>("");

    // Password reset field values with corresponding error messages
    const [passwordResetMail, setPasswordResetMail] = useState<string>("");
    const [passwordResetMailError, setPasswordResetMailError] = useState<string>("");
    const [showPasswordReset, setShowPasswordReset] = useState<boolean>(false);

    /**
     * Executed upon trying to login
     * Checks that inputfields are not empty and sends a request to the backend
     * Redirects to the home page if succesfull else returns an error message
     *
     * @param e - The event triggering this function call
     */
    const submitLogin = async (e: SyntheticEvent) => {
        e.preventDefault();

        let error = false

        if (loginEmail === "") {
            setLoginEmailError("Email cannot be empty");
            error = true
        } else {
            setLoginEmailError("");
        }

        if (loginPassword === "") {
            setLoginPasswordError("Password cannot be empty");
            error = true
        } else {
            setLoginPasswordError("");
        }

        // Fields are not empty
        if (!error) {
            // We encrypt the password before sending it to the backend api
            const encryptedPassword = crypto.createHash('sha256').update(loginPassword).digest('hex');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                method: 'POST',
                body: JSON.stringify({pass: encryptedPassword, name: loginEmail}),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
                .then(response => response.json()).then(json => {
                    if (!json.success) {
                        setLoginBackendError(`Failed to login. ${json.reason}`);
                        return {success: false};
                    } else return json;
                })
                .catch(err => {
                    setLoginBackendError(`Failed to login. ${err.reason}`);
                    return {success: false};
                });

            // The user is succesfully logged in and we can use the sessionkey provided by the backend
            if (response.success) {
                if (setSessionKey) {
                    setSessionKey(response.sessionkey)
                }
                if (setIsAdmin) {
                    setIsAdmin(response.is_admin)
                }
                if (setIsCoach) {
                    setIsCoach(response.is_coach)
                }
                router.push("/students").then()
            }
        }
    }

    /**
     * Executed upon trying to register
     * Checks that inputfields are not empty and sends a request to the backend
     * Redirects to the home page if succesfull else returns an error message
     *
     * @param e - The event triggering this function call
     */
    const submitRegister = async (e: SyntheticEvent) => {
        e.preventDefault();

        let error = false

        if (registerEmail === "") {
            setRegisterEmailError("Email cannot be empty");
            error = true
        } else {
            setRegisterEmailError("");
        }

        if (registerFirstName === "") {
            setRegisterFirstNameError("First name cannot be empty")
            error = true
        } else {
            setRegisterFirstNameError("")
        }

        if (registerLastName === "") {
            setRegisterLastNameError("Last name cannot be empty")
            error = true
        } else {
            setRegisterLastNameError("")
        }

        if (registerPassword === "") {
            setRegisterPasswordError("Password cannot be empty");
            error = true
        } else {
            setRegisterPasswordError("");
        }

        if (registerPassword != registerConfirmPassword) {
            setRegisterConfirmPasswordError("Passwords do not match");
            error = true
        } else if (registerConfirmPassword === "") {
            setRegisterConfirmPasswordError("Password cannot be empty")
            error = true
        } else {
            setRegisterConfirmPasswordError("");
        }

        // Fields are not empty
        if (!error) {
            const encryptedPassword = crypto.createHash('sha256').update(registerPassword).digest('hex');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coach/request`, {
                method: 'POST',
                body: JSON.stringify({
                    firstName: registerFirstName,
                    lastName: registerLastName,
                    emailOrGithub: registerEmail,
                    pass: encryptedPassword
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
                .then(response => response.json()).then(json => {
                    if (!json.success) {
                        setRegisterBackendError('Failed to register. Please check all fields. ' + json.reason);
                        return Promise.resolve({success: false});
                    } else return json;
                })
                .catch(json => {
                    setRegisterBackendError('Failed to register. Please check all fields. ' + json.reason);
                    return Promise.resolve({success: false});
                });

            if (response.success) {
                await router.push("/pending")
            }
        }
    }

    /**
     * When the users want to login with github we follow the github web authentication application flow
     * https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow
     *
     * Redirect to homepage upon succes
     *
     * @param e - The event triggering this function call
     */
    const githubLogin = async (e: SyntheticEvent) => {
        e.preventDefault();
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/github`
    }

    /**
     * Handles password reset requests from the popup modal
     *
     * @param e - The event triggering this function call
     */
    const resetPassword = async (e: SyntheticEvent) => {
        e.preventDefault()

        let error = false

        if (passwordResetMail === "") {
            setPasswordResetMailError("Email cannot be empty")
            error = true
        } else {
            setPasswordResetMailError("")
        }

        // Field is not empty
        if (!error) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset`, {
                method: 'POST',
                body: JSON.stringify({email: passwordResetMail}),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }).then(res => res.json()).catch(error => console.log(error))
            if (response.success) {
                setPasswordResetMailError("")
                setShowPasswordReset(false)
                // TODO -- Notification
            } else {
                setPasswordResetMailError(response.reason)
            }
        }

    }

    // Show password reset modal
    const showModal = (e: SyntheticEvent) => {
        e.preventDefault()
        setShowPasswordReset(true)
    }

    // Close password reset modal
    const closeModal = (e: SyntheticEvent) => {
        e.preventDefault();
        setShowPasswordReset(false)
    }

    return (
        <div>
            <Header/>
            <div className={styles.body}>
                <h3>Welcome to OSOC Selections!</h3>
                <h3 className="subtext">Please login, or register to proceed</h3>
                <div className={styles.formContainer}>
                    <div className={styles.loginContainer}>
                        <h2>Login</h2>
                        <form className={styles.form} onSubmit={async e => {
                            await submitLogin(e)
                        }}>
                            <label className={styles.label}>
                                Email
                                <input type="text" name="loginEmail" value={loginEmail}
                                       onChange={e => setLoginEmail(e.target.value)}/>
                            </label>
                            <p className={`${styles.textFieldError} ${loginEmailError !== "" ? styles.anim : ""}`}>{loginEmailError}</p>
                            <label className={styles.label}>
                                Password
                                <input type="password" name="loginPassword" value={loginPassword}
                                       onChange={e => setLoginPassword(e.target.value)}/>
                            </label>
                            <p className={`${styles.textFieldError} ${loginPasswordError !== "" ? styles.anim : ""}`}>{loginPasswordError}</p>
                            <a className={styles.resetPassword} onClick={showModal}>Forgot password?</a>
                            <Modal handleClose={closeModal} visible={showPasswordReset}
                                   title="Please enter your email below and we will send you a link to reset your password.">
                                <label className={styles.label}>
                                    <input type="text" name="loginEmail"
                                           value={passwordResetMail}
                                           onChange={e => setPasswordResetMail(e.target.value)}/>
                                </label>
                                <p className={`${styles.textFieldError} ${passwordResetMailError !== "" ? styles.anim : ""}`}>{passwordResetMailError}</p>
                                <button onClick={resetPassword}>CONFIRM</button>
                            </Modal>
                            <button onClick={e => submitLogin(e)}>LOG IN</button>
                            <p className={`${styles.textFieldError} ${loginBackendError !== "" ? styles.anim : ""}`}>{loginBackendError}</p>
                            <div className={styles.orContainer}>
                                <div/>
                                <p>or</p>
                                <div/>
                            </div>
                            <div className={styles.githubContainer} onClick={e => githubLogin(e)}>
                                <div className={styles.githublogo}>
                                    <Image
                                        src={GitHubLogo}
                                        layout="intrinsic"
                                        alt="GitHub Logo"
                                    />
                                </div>
                                <p className={styles.github}>Continue with GitHub</p>
                            </div>
                        </form>
                    </div>

                    <div className={styles.registerContainer}>
                        <h2>Register</h2>
                        <form className={styles.form} onSubmit={async e => {
                            await submitRegister(e)
                        }}>
                            <label className={styles.label}>
                                First Name
                                <input type="text" name="registerFirstName" value={registerFirstName}
                                       onChange={e => setRegisterFirstName(e.target.value)}/>
                            </label>
                            <p className={`${styles.textFieldError} ${registerFirstNameError !== "" ? styles.anim : ""}`}>{registerFirstNameError}</p>
                            <label className={styles.label}>
                                Last Name
                                <input type="text" name="registerLastName" value={registerLastName}
                                       onChange={e => setRegisterLastName(e.target.value)}/>
                            </label>
                            <p className={`${styles.textFieldError} ${registerLastNameError !== "" ? styles.anim : ""}`}>{registerLastNameError}</p>
                            <label className={styles.label}>
                                Email
                                <input type="text" name="registerEmail" value={registerEmail}
                                       onChange={e => setRegisterEmail(e.target.value)}/>
                            </label>
                            <p className={`${styles.textFieldError} ${registerEmailError !== "" ? styles.anim : ""}`}>{registerEmailError}</p>
                            <label className={styles.label}>
                                Password
                                <input type="password" name="registerPassword" value={registerPassword}
                                       onChange={e => setRegisterPassword(e.target.value)}/>
                            </label>
                            <p className={`${styles.textFieldError} ${registerPasswordError !== "" ? styles.anim : ""}`}>{registerPasswordError}</p>
                            <label className={styles.label}>
                                Confirm Password
                                <input type="password" name="registerConfirmPassword" value={registerConfirmPassword}
                                       onChange={e => setRegisterConfirmPassword(e.target.value)}/>
                            </label>
                            <p className={`${styles.textFieldError} ${registerConfirmPasswordError !== "" ? styles.anim : ""}`}>{registerConfirmPasswordError}</p>
                            <button onClick={e => submitRegister(e)}>REGISTER</button>
                            <p className={`${styles.textFieldError} ${registerBackendError !== "" ? styles.anim : ""}`}>{registerBackendError}</p>
                        </form>
                    </div>
                </div>
            </div>
        </div>)
}

export default Index;


export type SignInResult = {
    /**
     * Will be different error codes,
     * depending on the type of error.
     */
    error: string | undefined
    /**
     * HTTP status code,
     * hints the kind of error that happened.
     */
    status: number
    /**
     * `true` if the signin was successful
     */
    ok: boolean
    /**
     * `null` if there was an error,
     * otherwise the url the user
     * should have been redirected to.
     */
    url: string | null
}
