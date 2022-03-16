import type {NextPage} from 'next'
import styles from '../styles/login.module.css'
import Image from "next/image"
import LogoOsocColor from "../public/images/logo-osoc-color.svg"
import GitHubLogo from "../public/images/github-logo.svg"
import {SyntheticEvent, useState} from "react";

const Login: NextPage = () => {

    const [loginEmail, setLoginEmail] = useState<string>("");
    const [loginEmailError, setLoginEmailError] = useState<string>("");
    const [loginPassword, setLoginPassword] = useState<string>("");
    const [loginPasswordError, setLoginPasswordError] = useState<string>("");

    const [registerEmail, setRegisterEmail] = useState<string>("");
    const [registerEmailError, setRegisterEmailError] = useState<string>("");
    const [registerPassword, setRegisterPassword] = useState<string>("");
    const [registerPasswordError, setRegisterPasswordError] = useState<string>("");
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState<string>("");
    const [registerConfirmPasswordError, setRegisterConfirmPasswordError] = useState<string>("");

    /**
     * Executed upon trying to login
     * Checks that inputfields are not empty and sends a request to the backend
     * Redirects to the home page if succesfull else returns an error message
     *
     * @param e - The event triggering this function call
     */
    const submitLogin = (e: SyntheticEvent) => {
        e.preventDefault();

        if (loginEmail === "") {
            setLoginEmailError("Email cannot be empty");
        } else {
            setLoginEmailError("");
        }

        if (loginPassword === "") {
            setLoginPasswordError("Password cannot be empty");
        } else {
            setLoginPasswordError("");
        }


        // TODO -- Send call to the backend
        // TODO -- Handle response
        console.log("LOGGING IN...")
    }

    const submitRegister = (e: SyntheticEvent) => {
        e.preventDefault();

        if (registerEmail === "") {
            setRegisterEmailError("Email cannot be empty");
        } else {
            setRegisterEmailError("");
        }

        if (registerPassword === "") {
            setRegisterPasswordError("Password cannot be empty");
        } else {
            setRegisterPasswordError("");
        }

        if (registerPassword != registerConfirmPassword) {
            setRegisterConfirmPasswordError("Passwords do not match");
        } else if (registerConfirmPasswordError === "") {
            setRegisterConfirmPasswordError("Password cannot be empty")
        } else {
            setRegisterConfirmPasswordError("");
        }

        // TODO -- Send call to the backend
        // TODO -- Handle response
        console.log("REGISTERING...")
    }

    const githubLogin = (e: SyntheticEvent) => {
        e.preventDefault();
        // TODO
        console.log("LOGGING IT WITH GITHUB...");
    }

    return (
        <div>
            <header className={styles.header}>
                <div>
                    <div className={styles.imagecontainer}>
                        <Image
                            src={LogoOsocColor}
                            layout="intrinsic"
                            alt="OSOC Logo"
                        />
                    </div>
                    <h1>Selections</h1>
                </div>
            </header>
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
                            <a className={styles.resetPassword} href="#forgotPassword">Forgot password?</a>
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
