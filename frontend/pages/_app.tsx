import '../styles/globals.css'
import type {AppProps} from 'next/app'
import {SyntheticEvent, useState} from "react";
import styles from "../styles/index.module.css";
import Image from "next/image";
import LogoOsocColor from "../public/images/logo-osoc-color.svg";
import Link from "next/link";
import {useRouter} from "next/router";

function App({Component, pageProps}: AppProps) {

    const router = useRouter()

    // TODO keep user state (logged in, pending, coach / admin, ...)
    const [loggedIn, setLoggedIn] = useState<boolean>(true);

    const logOut = (e: SyntheticEvent) => {
        e.preventDefault()
        router.push("/login").then(() => setLoggedIn(false))
    }

    return (<div>
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
                <div className={`${styles.links} ${!loggedIn ? styles.displayNone : ""}`}>
                    <Link href={"/students"}>Students</Link>
                    <Link href={"/projects"}>Projects</Link>
                    <Link href={"/users"}>Manage Users</Link>
                    <button onClick={logOut}>Log out</button>
                </div>
            </header>
            <Component {...pageProps} />
        </div>
    )
}

export default App
