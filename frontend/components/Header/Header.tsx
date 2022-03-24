import styles from "./Header.module.css";
import Image from "next/image";
import LogoOsocColor from "../../public/images/logo-osoc-color.svg";
import Link from "next/link";
import React, {SyntheticEvent} from "react";
import {signOut, useSession} from "next-auth/react";

export const Header: React.FC = () => {

    const {status} = useSession()

    const logOut = (e: SyntheticEvent) => {
        e.preventDefault()
        signOut({callbackUrl: "/login"}).then()
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
            <div className={`${styles.links} ${status === "authenticated" ? "" : styles.displayNone}`}>
                <Link href={"/students"}>Students</Link>
                <Link href={"/projects"}>Projects</Link>
                <Link href={"/users"}>Manage Users</Link>
                <button onClick={logOut}>Log out</button>
            </div>
        </header>
    )
}