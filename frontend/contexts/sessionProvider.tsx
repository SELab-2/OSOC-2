import React, { createContext, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AccountStatus } from "../types";

/**
 * Interface for the context, stores the user session application wide
 */
interface ISessionContext {
    // Needs to be used in the useEffect function, because state variabeles are not yet available at that time
    getSession?: () => Promise<{
        sessionKey: string;
        isAdmin: boolean;
        isCoach: boolean;
    }>;
    sessionKey: string;
    setSessionKey?: (key: string) => void;

    isCoach: boolean;
    setIsCoach?: (coach: boolean) => void;
    isAdmin: boolean;
    setIsAdmin?: (admin: boolean) => void;
    /* Boolean that is true when the user has been verified */
    isVerified: boolean;
    setIsVerified?: (verified: boolean) => void;
}

// The default state the application is in
const defaultState = {
    sessionKey: "", // No user is logged in
    isCoach: false,
    isAdmin: false,
    isVerified: false,
};

const SessionContext = createContext<ISessionContext>(defaultState);

/**
 * The sesssion provider is responsible for storing the user session both at runtime and in local storage
 * The session prodiver also reads the session from local storage if present
 * @param children
 * @constructor
 */
export const SessionProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const router = useRouter();

    const [sessionKey, setSessionKeyState] = useState<string>("");
    const [isCoach, setIsCoach] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isVerified, setIsVerified] = useState<boolean>(false);

    // Because `useEffect` can have a different order we need to check if the session id has already been verified
    let verified = false;
    let pendingChecked = false;

    /**
     * Everytime the page is reloaded we need to get the session from local storage
     */
    useEffect(() => {
        if (!verified) {
            getSession().then();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * The `useEffect` is not always called before other page's use effect
     * Therefore we can use this function to get the session in the useEffect functions
     * Performs a backend call to verify the session id and also updates the session
     */
    const getSession = async () => {
        // Get the sessionKey from localStorage
        const fromStorage = localStorage.getItem("sessionKey");
        const sessionKey = fromStorage ? fromStorage : "";

        if (sessionKey === "") {
            if (
                !(
                    router.pathname.startsWith("/login") ||
                    router.pathname.startsWith("/reset") ||
                    router.pathname.startsWith("/pending")
                )
            ) {
                router.push("/login").then();
            }
            return { sessionKey: "", isAdmin: isAdmin, isCoach: isCoach };
        }

        // we already did a request, and we know we are pending (key is invalid) => go to pending
        if (pendingChecked) {
            router.push("/pending").then();
            return { sessionKey: "", isAdmin: false, isCoach: false };
        }

        // Avoid calling /verify twice
        // verified gets set to false every page reload
        if (verified) {
            return { sessionKey: "", isAdmin: isAdmin, isCoach: isCoach };
        }

        verified = true;
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `auth/osoc2 ${sessionKey}`,
            },
        })
            .then((response) => response.json())
            .then((response) => {
                setIsAdmin(response.is_admin);
                setIsCoach(response.is_coach);
                if (
                    !response.valid ||
                    response.account_status === AccountStatus.DISABLED
                ) {
                    if (
                        !(
                            router.pathname.startsWith("/login") ||
                            router.pathname.startsWith("/pending")
                        )
                    ) {
                        router.push("/login");
                    }
                    setSessionKey("");
                    return {
                        sessionKey: sessionKey,
                        isAdmin: response.is_admin,
                        isCoach: response.is_coach,
                    };
                }
                if (response.account_status === AccountStatus.PENDING) {
                    pendingChecked = true; // otherwise the next request will think it's automatically true, even when it has an invalid key.
                    router.push("/pending");
                    return { sessionKey: "", isAdmin: false, isCoach: false };
                }
                setSessionKey(sessionKey);
                setIsVerified(true);
                return {
                    sessionKey: sessionKey,
                    isAdmin: response.is_admin,
                    isCoach: response.is_coach,
                };
            })
            .catch((error) => {
                console.log(error);
                setIsAdmin(false);
                setIsCoach(false);
                if (!router.pathname.startsWith("/login")) {
                    router.push("/login");
                }
                setSessionKey("");
                setIsVerified(true);
                return { sessionKey: "", isAdmin: false, isCoach: false };
            });
    };

    const setSessionKey = (sessionKey: string) => {
        setSessionKeyState(sessionKey);
        // Update localStorage
        localStorage.setItem("sessionKey", sessionKey);
    };

    return (
        <SessionContext.Provider
            value={{
                getSession,
                sessionKey,
                setSessionKey,
                isCoach,
                isAdmin,
                isVerified,
                setIsVerified,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};

export default SessionContext;
