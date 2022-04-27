import styles from "./Header.module.css";
import Image from "next/image";
import LogoOsocColor from "../../public/images/logo-osoc-color.svg";
import Link from "next/link";
import React, { SyntheticEvent, useContext } from "react";
import SessionContext from "../../contexts/sessionProvider";
import { useRouter } from "next/router";

export const Header: React.FC = () => {
    const {
        sessionKey,
        isVerified,
        setSessionKey,
        isAdmin,
        setIsAdmin,
        setIsCoach,
        setIsVerified,
    } = useContext(SessionContext);

    const router = useRouter();

    const logIn = (e: SyntheticEvent) => {
        e.preventDefault();
        router.push("/login").then();
    };

    const logOut = (e: SyntheticEvent) => {
        e.preventDefault();
        if (setSessionKey) {
            setSessionKey("");
        }
        if (setIsAdmin) {
            setIsAdmin(false);
        }
        if (setIsCoach) {
            setIsCoach(false);
        }
        if (setIsVerified) {
            setIsVerified(false);
        }
        router.push("/login").then(() => {
            // After being redirected to the login page, let the backend now that the user has logged out.
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `auth/osoc2 ${sessionKey}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        console.log(response);
                    }
                })
                .catch((error) => console.log(error));
        });
    };

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
            <div
                className={`${styles.links} ${
                    router.pathname !== "/login" ? "" : styles.displayNone
                }`}
            >
                {isVerified && !router.pathname.startsWith("/reset") ? (
                    <Link href={"/students"}>Students</Link>
                ) : null}
                {isVerified && !router.pathname.startsWith("/reset") ? (
                    <Link href={"/projects"}>Projects</Link>
                ) : null}
                {isVerified && !router.pathname.startsWith("/reset") ? (
                    <Link href={"/osocs"}>Osoc Editions</Link>
                ) : null}
                {sessionKey !== "" &&
                isVerified &&
                isAdmin &&
                !router.pathname.startsWith("/reset") ? (
                    <Link href={"/users"}>Manage Users</Link>
                ) : null}
                {(isVerified &&
                    router.pathname !== "/login" &&
                    !router.pathname.startsWith("/reset")) ||
                router.pathname.startsWith("/pending") ? (
                    <button onClick={logOut}>Log out</button>
                ) : isVerified && router.pathname.startsWith("/reset") ? (
                    <button onClick={logIn}>Log in</button>
                ) : null}
            </div>
        </header>
    );
};
