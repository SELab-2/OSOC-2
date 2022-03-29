import styles from "./Header.module.css";
import Image from "next/image";
import LogoOsocColor from "../../public/images/logo-osoc-color.svg";
import Link from "next/link";
import React, {SyntheticEvent, useContext} from "react";
import SessionContext from "../../pages/contexts/sessionProvider";

export const Header: React.FC = () => {

    const { sessionKey } = useContext(SessionContext)

    const logOut = (e: SyntheticEvent) => {
        e.preventDefault()
        // TODO
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
            <div className={`${styles.links} ${sessionKey !== "" ? "" : styles.displayNone}`}>
                <Link href={"/students"}>Students</Link>
                <Link href={"/projects"}>Projects</Link>
                <Link href={"/users"}>Manage Users</Link>
                <button onClick={logOut}>Log out</button>
            </div>
        </header>
    )
}
