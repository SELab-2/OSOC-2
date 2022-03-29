import styles from "./Header.module.css";
import Image from "next/image";
import LogoOsocColor from "../../public/images/logo-osoc-color.svg";
import Link from "next/link";
import React, {SyntheticEvent, useContext} from "react";
import SessionContext from "../../contexts/sessionProvider";
import {useRouter} from "next/router";

export const Header: React.FC = () => {

    const {sessionKey, setSessionKey, isAdmin, setIsAdmin, setIsCoach} = useContext(SessionContext)

    const router = useRouter()

    /**
     * Resets the session state and redirects to the login page
     * @param e
     */
    const logOut = (e: SyntheticEvent) => {
        e.preventDefault()
        if (setSessionKey) {
            setSessionKey("")
        }
        if (setIsAdmin) {
            setIsAdmin(false)
        }
        if (setIsCoach) {
            setIsCoach(false)
        }
        router.push("/login").then()
    }

    return (
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
            <div className={`${styles.links} ${router.pathname !== "/login" ? "" : styles.displayNone}`}>
                {sessionKey !== "" ? <Link href={"/students"}>Students</Link> : null}
                {sessionKey !== "" ? <Link href={"/projects"}>Projects</Link> : null}
                {isAdmin ? <Link href={"/users"}>Manage Users</Link> : null}
                <button onClick={logOut}>Log out
                </button>
            </div>
        </header>
    )
}
