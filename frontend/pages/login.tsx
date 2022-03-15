import type {NextPage} from 'next'
import styles from '../styles/login.module.css'
import Image from "next/image"
import LogoOsocColor from "../public/images/logo-osoc-color.svg"
import {SyntheticEvent, useState} from "react";

const Login: NextPage = () => {

    const [loginEmail, setLoginEmail] = useState<string>();
    const [loginPassword, setLoginPassword] = useState<string>();

    const [registerEmail, setRegisterEmail] = useState<string>();
    const [registerPassword, setRegisterPassword] = useState<string>();
    const [registerConfirmPassword, setRegisterConfirmPassword] = useState<string>();

    const submitLogin = (e: SyntheticEvent) => {
        e.preventDefault();
        console.log(loginEmail);
        console.log(loginPassword);
        console.log("LOGGING IN...")
        // TODO
    }

    const submitRegister = (e: SyntheticEvent) => {
        e.preventDefault();
        console.log(registerEmail);
        console.log(registerPassword);
        console.log(registerConfirmPassword);
        console.log("REGISTERING...")
        // TODO
    }

    const githubLogin = (e: SyntheticEvent) => {
        e.preventDefault();
        console.log("LOGGING IT WITH GITHUB...");
        // TODO
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
            <body>
            <h3>Welcome to OSOC Selections!</h3>
            <h3>Please login, or register to proceed</h3>
            <h2>Login</h2>
            <form onSubmit={e => {
                submitLogin(e)
            }}>
                <label>
                    Email
                    <input type="text" name="loginEmail" value={loginEmail}
                           onChange={e => setLoginEmail(e.target.value)}/>
                </label>
                <label>
                    Password
                    <input type="password" name="loginPassword" value={loginPassword}
                           onChange={e => setLoginPassword(e.target.value)}/>
                </label>
                <input type="submit" value="LOG IN"/>
            </form>

            <button onClick={e => githubLogin(e)}>Log in with GitHub</button>

            <h2>Register</h2>
            <form onSubmit={e => {
                submitRegister(e)
            }}>
                <label>
                    Email
                    <input type="text" name="registerEmail" value={registerEmail}
                           onChange={e => setRegisterEmail(e.target.value)}/>
                </label>
                <label>
                    Password
                    <input type="password" name="registerPassword" value={registerPassword}
                           onChange={e => setRegisterPassword(e.target.value)}/>
                </label>
                <label>
                    Confirm Password
                    <input type="password" name="registerConfirmPassword" value={registerConfirmPassword}
                           onChange={e => setRegisterConfirmPassword(e.target.value)}/>
                </label>
                <input type="submit" value="REGISTER"/>
            </form>
            </body>
        </div>)
}

export default Login;
