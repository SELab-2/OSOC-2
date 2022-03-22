import type {NextPage} from 'next'
import styles from '../styles/login.module.css'
import Image from "next/image"
import GitHubLogo from "../public/images/github-logo.svg"
import {SyntheticEvent, useState} from "react";
import {Modal} from "../components/Modal/Modal";
import {useRouter} from "next/router";
import {signIn} from "next-auth/react";
import {Header} from "../components/Header/Header";

const Login: NextPage = () => {

    const router = useRouter()

    // Login field values with corresponding error messages
    const [loginEmail, setLoginEmail] = useState<string>("");
    const [loginEmailError, setLoginEmailError] = useState<string>("");
    const [loginPassword, setLoginPassword] = useState<string>("");
    const [loginPasswordError, setLoginPasswordError] = useState<string>("");

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

        let error: boolean = false

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
            // TODO -- Send call to the backend
            // TODO -- Handle response
            console.log(loginEmail)
            console.log(loginPassword)
            signIn('credentials', {
                username: loginEmail,
                password: loginPassword,
                redirect: false
            }).then(res => {
                    // TODO -- Redirect or handle errors
                    console.log(res)
                    if (res !== undefined) {
                        const signInRes = res as SignInResult
                        // The user is succesfully logged in => redirect to /students
                        if (signInRes.error === null && signInRes.ok && signInRes.status === 200) {
                            console.log("redirect")
                            router.push("/students")
                        }
                    }
                }
            )
        }
    }

    /**
     * Executed upon trying to register
     * Checks that inputfields are not empty and sends a request to the backend
     * Redirects to the home page if succesfull else returns an error message
     *
     * @param e - The event triggering this function call
     */
    const submitRegister = (e: SyntheticEvent) => {
        e.preventDefault();

        let error: boolean = false

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
            // TODO -- Send call to the backend
            // TODO -- Handle response
            console.log("REGISTERING...")
            router.push("/students").then()
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
    const githubLogin = (e: SyntheticEvent) => {
        e.preventDefault();
        // TODO
        console.log("LOGGING IT WITH GITHUB...");
        signIn("github", {callbackUrl: "/students"}).then(res => {
            console.log(`github response: ${res}`)
        })
    }

    /**
     * Handles password reset requests from the popup modal
     *
     * @param e - The event triggering this function call
     */
    const resetPassword = (e: SyntheticEvent) => {
        e.preventDefault()

        let error: boolean = false

        if (passwordResetMail === "") {
            setPasswordResetMailError("Email cannot be empty")
            error = true
        } else {
            setPasswordResetMailError("")
        }

        // Field is not empty
        if (!error) {
            console.log("RESETTING PASSWORD")
            setShowPasswordReset(false)
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
                        <form className={styles.form} onSubmit={e => {
                            submitLogin(e)
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
                            <Modal handleClose={closeModal} visible={showPasswordReset}>
                                <p>Please enter your email below and we will send you a link to reset your password.</p>
                                <label className={styles.label}>
                                    <input type="text" name="loginEmail"
                                           value={passwordResetMail === "" ? loginEmail : passwordResetMail}
                                           onChange={e => setPasswordResetMail(e.target.value)}/>
                                </label>
                                <p className={`${styles.textFieldError} ${passwordResetMailError !== "" ? styles.anim : ""}`}>{passwordResetMailError}</p>
                                <button onClick={resetPassword}>CONFIRM</button>
                            </Modal>
                            <button onClick={e => submitLogin(e)}>LOG IN</button>
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
                        <form className={styles.form} onSubmit={e => {
                            submitRegister(e)
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
                        </form>
                    </div>
                </div>
            </div>
        </div>)
}

export default Login;


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
