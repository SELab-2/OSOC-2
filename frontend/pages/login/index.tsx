import type { NextPage } from "next";
import styles from "./login.module.scss";
import Image from "next/image";
import GitHubLogo from "../../public/images/github-logo.svg";
import { SyntheticEvent, useContext, useEffect, useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { useRouter } from "next/router";

import SessionContext from "../../contexts/sessionProvider";
import isStrongPassword from "validator/lib/isStrongPassword";

import * as validator from "validator";
import { AccountStatus, NotificationType } from "../../types";
import { useSockets } from "../../contexts/socketProvider";
import { NotificationContext } from "../../contexts/notificationProvider";

const Index: NextPage = () => {
    const router = useRouter();
    const { getSession, setSessionKey, setIsAdmin, setIsCoach } =
        useContext(SessionContext);
    const { notify } = useContext(NotificationContext);
    const { socket } = useSockets();

    // Sets an error message when the `loginError` query parameter is present
    useEffect(() => {
        if (getSession) {
            getSession().then(({ sessionKey }) => {
                // The user is already logged in, redirect the user
                if (sessionKey != "") {
                    router.push("/students").then();
                }
            });
        }

        const { loginError } = router.query;
        if (loginError != undefined) {
            if (typeof loginError === "string") {
                setLoginBackendError(loginError);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.query]);

    // Index field values with corresponding error messages
    const [loginEmail, setLoginEmail] = useState<string>("");
    const [loginEmailError, setLoginEmailError] = useState<string>("");
    const [loginPassword, setLoginPassword] = useState<string>("");
    const [loginPasswordError, setLoginPasswordError] = useState<string>("");
    const [loginBackendError, setLoginBackendError] = useState<string>("");

    // Register field values with corresponding error messages
    const [registerEmail, setRegisterEmail] = useState<string>("");
    const [registerEmailError, setRegisterEmailError] = useState<string>("");
    const [registerName, setRegisterName] = useState<string>("");
    const [registerNameError, setRegisterNameError] = useState<string>("");
    const [registerPassword, setRegisterPassword] = useState<string>("");
    const [registerPasswordError, setRegisterPasswordError] =
        useState<string>("");
    const [registerConfirmPassword, setRegisterConfirmPassword] =
        useState<string>("");
    const [registerConfirmPasswordError, setRegisterConfirmPasswordError] =
        useState<string>("");
    const [registerBackendError, setRegisterBackendError] =
        useState<string>("");
    const [registerPasswordScore, setRegisterPasswordScore] =
        useState<number>(0);

    // Password reset field values with corresponding error messages
    const [passwordResetMail, setPasswordResetMail] = useState<string>("");
    const [passwordResetMailError, setPasswordResetMailError] =
        useState<string>("");
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

        let error = false;
        if (loginEmail === "") {
            setLoginEmailError("Email cannot be empty");
            error = true;
        } else {
            setLoginEmailError("");
        }

        if (loginPassword === "") {
            setLoginPasswordError("Password cannot be empty");
            error = true;
        } else {
            setLoginPasswordError("");
        }

        // Fields are not empty
        if (!error) {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/login`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        pass: loginPassword,
                        name: loginEmail,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            )
                .then((response) => response.json())
                .catch(() => {
                    setLoginBackendError(
                        `Something went wrong while trying to login.`
                    );
                    return { success: false };
                });
            if (response && !response.success) {
                setLoginBackendError(`Failed to login. ${response.reason}`);
            }
            // The user is successfully logged in and we can use the sessionkey provided by the backend
            if (response.success) {
                if (setSessionKey) {
                    setSessionKey(response.sessionkey);
                }
                if (setIsAdmin) {
                    setIsAdmin(response.is_admin);
                }
                if (setIsCoach) {
                    setIsCoach(response.is_coach);
                }
                if (notify) {
                    notify("Login successful!", NotificationType.SUCCESS, 2000);
                }
                if (response.account_status === AccountStatus.ACTIVATED) {
                    router.push("/students").then();
                } else if (response.account_status === AccountStatus.PENDING) {
                    router.push("/pending").then();
                }
            }
        }
    };

    /**
     * Checks the password strength using `isStrongPassword` from validator
     * @param password
     */
    const updateRegisterPassword = (password: string) => {
        const score = isStrongPassword(password, {
            returnScore: true,
        }) as unknown as number;
        setRegisterPasswordScore(score);
        setRegisterPasswordError("");
        setRegisterPassword(password);
    };

    /**
     * Converts the register password strength score to a textual representation
     */
    const scoreToText = () => {
        if (registerPasswordScore < 20) {
            return "Weak";
        }

        if (registerPasswordScore < 40) {
            return "Moderate";
        }

        return "Strong";
    };

    /**
     * Returns a style for the current password strength
     */
    const scoreToStyle = () => {
        if (registerPasswordScore < 20) {
            return styles.weak;
        }

        if (registerPasswordScore < 40) {
            return styles.moderate;
        }

        return styles.strong;
    };

    /**
     * Executed upon trying to register
     * Checks that inputfields are not empty and sends a request to the backend
     * Redirects to the home page if succesfull else returns an error message
     *
     * @param e - The event triggering this function call
     */
    const submitRegister = async (e: SyntheticEvent) => {
        e.preventDefault();

        let error = false;

        if (registerEmail === "") {
            setRegisterEmailError("Email cannot be empty");
            error = true;
        } else if (!validator.default.isEmail(registerEmail)) {
            setRegisterEmailError("No valid email address");
            error = true;
        } else {
            setRegisterEmailError("");
        }

        if (registerName === "") {
            setRegisterNameError("Name cannot be empty");
            error = true;
        } else {
            setRegisterNameError("");
        }

        if (registerPassword === "") {
            setRegisterPasswordError("Password cannot be empty");
            error = true;
        } else if (registerPasswordScore < 20) {
            error = true;
            setRegisterPasswordError("Please provide a secure enough password");
        } else {
            setRegisterPasswordError("");
        }

        if (registerPassword != registerConfirmPassword) {
            setRegisterConfirmPasswordError("Passwords do not match");
            error = true;
        } else if (registerConfirmPassword === "") {
            setRegisterConfirmPasswordError("Password cannot be empty");
            error = true;
        } else {
            setRegisterConfirmPasswordError("");
        }

        // Fields are not empty
        if (!error) {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/user/request`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        name: registerName.trim(),
                        email: registerEmail,
                        pass: registerPassword,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            )
                .then((response) => response.json())
                .then((json) => {
                    if (!json.success) {
                        setRegisterBackendError(
                            "Failed to register. Please check all fields. " +
                                json.reason
                        );
                        return Promise.resolve({ success: false });
                    } else return json;
                })
                .catch((json) => {
                    setRegisterBackendError(
                        "Failed to register. Please check all fields. " +
                            json.reason
                    );
                    return Promise.resolve({ success: false });
                });

            if (response.success) {
                if (setSessionKey) {
                    setSessionKey(response.sessionkey);
                    socket.emit("submitRegistration");
                }
                await router.push("/pending");
            }
        }
    };

    /**
     * When the users want to login with github we follow the github web authentication application flow
     * https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow
     *
     * Redirect to homepage upon success
     *
     * @param e - The event triggering this function call
     */
    const githubLogin = async (e: SyntheticEvent) => {
        e.preventDefault();
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/github`;
    };

    /**
     * Handles password reset requests from the popup modal
     *
     * @param e - The event triggering this function call
     */
    const resetPassword = async (e: SyntheticEvent) => {
        e.preventDefault();

        let error = false;

        if (passwordResetMail === "") {
            setPasswordResetMailError("Email cannot be empty");
            error = true;
        } else {
            setPasswordResetMailError("");
        }

        // Field is not empty
        if (!error) {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/reset`,
                {
                    method: "POST",
                    body: JSON.stringify({ email: passwordResetMail }),
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            )
                .then((res) => res.json())
                .catch((err) => {
                    console.log(err);
                });
            if (response.success) {
                setPasswordResetMailError("");
                setShowPasswordReset(false);
                if (notify) {
                    notify(
                        "Successfully sent a recovery email.!",
                        NotificationType.SUCCESS,
                        2000
                    );
                }
            } else {
                setPasswordResetMailError(response.reason);
            }
        }
    };

    // Show password reset modal
    const showModal = (e: SyntheticEvent) => {
        e.preventDefault();
        setShowPasswordReset(true);
    };

    // Close password reset modal
    const closeModal = (e: SyntheticEvent) => {
        e.preventDefault();
        setShowPasswordReset(false);
    };

    return (
        <div className={styles.body}>
            <h3>Welcome to OSOC Selections!</h3>
            <h3 className="subtext">Please login, or register to proceed</h3>
            <div className={styles.formContainer}>
                <div className={styles.loginContainer}>
                    <h2>Login</h2>
                    <form
                        className={styles.form}
                        onSubmit={async (e) => {
                            await submitLogin(e);
                        }}
                    >
                        <label className={styles.label}>
                            Email
                            <input
                                data-testid={"inputEmailLogin"}
                                type="text"
                                name="loginEmail"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                            />
                        </label>
                        <p
                            data-testid={"loginEmailError"}
                            className={`${styles.textFieldError} ${
                                loginEmailError !== "" ? styles.anim : ""
                            }`}
                        >
                            {loginEmailError}
                        </p>
                        <label className={styles.label}>
                            Password
                            <input
                                data-testid={"inputPassLogin"}
                                type="password"
                                name="loginPassword"
                                value={loginPassword}
                                onChange={(e) =>
                                    setLoginPassword(e.target.value)
                                }
                            />
                        </label>
                        <p
                            data-testid={"loginPasswordError"}
                            className={`${styles.textFieldError} ${
                                loginPasswordError !== "" ? styles.anim : ""
                            }`}
                        >
                            {loginPasswordError}
                        </p>
                        <a className={styles.resetPassword} onClick={showModal}>
                            Forgot password?
                        </a>
                        <Modal
                            handleClose={closeModal}
                            visible={showPasswordReset}
                            title="Password Reset"
                        >
                            <p>
                                Please enter your email below and we will send
                                you a link to reset your password.
                            </p>
                            <label className={styles.label}>
                                <input
                                    data-testid={"forgotPassInput"}
                                    type="text"
                                    name="loginEmail"
                                    value={passwordResetMail}
                                    onChange={(e) =>
                                        setPasswordResetMail(e.target.value)
                                    }
                                />
                            </label>
                            <p
                                data-testid={"forgotPassError"}
                                className={`${styles.textFieldError} ${
                                    passwordResetMailError !== ""
                                        ? styles.anim
                                        : ""
                                }`}
                            >
                                {passwordResetMailError}
                            </p>
                            <button
                                data-testid={"forgotPassConfirm"}
                                onClick={resetPassword}
                            >
                                CONFIRM
                            </button>
                        </Modal>
                        <button
                            data-testid={"loginButton"}
                            onClick={(e) => submitLogin(e)}
                        >
                            LOG IN
                        </button>
                        <p
                            data-testid={"backendErrorLogin"}
                            className={`${styles.textFieldError} ${
                                loginBackendError !== "" ? styles.anim : ""
                            }`}
                        >
                            {loginBackendError}
                        </p>
                        <div className={styles.orContainer}>
                            <div />
                            <p>or</p>
                            <div />
                        </div>
                        <div
                            data-testid={"githubLogin"}
                            className={styles.githubContainer}
                            onClick={(e) => githubLogin(e)}
                        >
                            <div className={styles.githublogo}>
                                <Image
                                    src={GitHubLogo}
                                    layout="intrinsic"
                                    alt="GitHub Logo"
                                />
                            </div>
                            <p className={styles.github}>
                                Continue with GitHub
                            </p>
                        </div>
                    </form>
                </div>

                <div className={styles.registerContainer}>
                    <h2>Register</h2>
                    <form
                        className={styles.form}
                        onSubmit={async (e) => {
                            await submitRegister(e);
                        }}
                    >
                        <label className={styles.label}>
                            Name
                            <input
                                data-testid={"nameRegister"}
                                type="text"
                                name="registerName"
                                value={registerName}
                                onChange={(e) =>
                                    setRegisterName(e.target.value)
                                }
                            />
                        </label>
                        <p
                            data-testid={"errorNameRegister"}
                            className={`${styles.textFieldError} ${
                                registerNameError !== "" ? styles.anim : ""
                            }`}
                        >
                            {registerNameError}
                        </p>
                        <label className={styles.label}>
                            Email
                            <input
                                data-testid={"emailRegister"}
                                type="text"
                                name="registerEmail"
                                value={registerEmail}
                                onChange={(e) =>
                                    setRegisterEmail(e.target.value)
                                }
                            />
                        </label>
                        <p
                            data-testid={"errorEmailRegister"}
                            className={`${styles.textFieldError} ${
                                registerEmailError !== "" ? styles.anim : ""
                            }`}
                        >
                            {registerEmailError}
                        </p>
                        <label className={styles.label}>
                            Password
                            <input
                                data-testid={"passwordRegister"}
                                type="password"
                                name="registerPassword"
                                value={registerPassword}
                                onChange={(e) =>
                                    updateRegisterPassword(e.target.value)
                                }
                            />
                        </label>
                        {registerPasswordError === "" &&
                        registerPassword !== "" ? (
                            <div
                                className={styles.anim}
                                style={{
                                    display: "inherit",
                                    justifyContent: "space-between",
                                }}
                            >
                                <p
                                    data-testid={"passStrength"}
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
                                data-testid={"passRegisterError"}
                                className={`${styles.textFieldError} ${
                                    registerPasswordError !== ""
                                        ? styles.anim
                                        : ""
                                }`}
                            >
                                {registerPasswordError}
                            </p>
                        )}
                        <label className={styles.label}>
                            Confirm Password
                            <input
                                data-testid={"rePasswordRegister"}
                                type="password"
                                name="registerConfirmPassword"
                                value={registerConfirmPassword}
                                onChange={(e) =>
                                    setRegisterConfirmPassword(e.target.value)
                                }
                            />
                        </label>
                        <p
                            data-testid={"errorRePasswordRegister"}
                            className={`${styles.textFieldError} ${
                                registerConfirmPasswordError !== ""
                                    ? styles.anim
                                    : ""
                            }`}
                        >
                            {registerConfirmPasswordError}
                        </p>
                        <button
                            data-testid={"registerButton"}
                            onClick={(e) => submitRegister(e)}
                        >
                            REGISTER
                        </button>
                        <p
                            data-testid={"errorBackendRegister"}
                            className={`${styles.textFieldError} ${
                                registerBackendError !== "" ? styles.anim : ""
                            }`}
                        >
                            {registerBackendError}
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Index;
