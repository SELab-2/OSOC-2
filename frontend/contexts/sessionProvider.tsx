import React, {createContext, ReactNode, useEffect, useState} from 'react';
import {useRouter} from "next/router";
import {AccountStatus} from "../types/types";

/**
 * Interface for the context, stores the user session application wide
 */
interface ISessionContext {
    sessionKey: string
    getSessionKey?: () => Promise<string>;
    setSessionKey?: (key: string) => void;

    isCoach: boolean;
    setIsCoach?: (coach: boolean) => void;
    isAdmin: boolean;
    setIsAdmin?: (admin: boolean) => void;
}

// The default state the application is in
const defaultState = {
    sessionKey: "", // No user is logged in
    isCoach: false,
    isAdmin: false
}


const SessionContext = createContext<ISessionContext>(defaultState);

/**
 * The sesssion provider is responsible for storing the user session both at runtime and in local storage
 * The session prodiver also reads the session from local storage if present
 * @param children
 * @constructor
 */
export const SessionProvider: React.FC<{ children: ReactNode }> = ({children}) => {

    const router = useRouter()

    const [sessionKey, setSessionKeyState] = useState<string>("");
    const [isCoach, setIsCoachState] = useState<boolean>(false);
    const [isAdmin, setIsAdminState] = useState<boolean>(false);

    // Because `useEffect` can have a different order we need to check if the session id has already been verified
    let verified = false

    /**
     * Everytime the page is reloaded we need to get the session from local storage
     */
    useEffect(() => {
        setIsAdmin(localStorage.getItem('isAdmin') === 'true' && sessionKey != "")
        setIsCoach(localStorage.getItem('isCoach') === 'true' && sessionKey != "")
        if (!verified) {
            getSessionKey().then()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * The `useEffect` is not always called before other page's use effect
     * Therefore we can use this function to get the sessionkey in the useEffect functions
     * Performs a backend call to verify the session id and also updates the session
     */
    const getSessionKey = async () => {
        // Get the sessionKey from localStorage
        const fromStorage = localStorage.getItem('sessionKey')
        const sessionKey = fromStorage ? fromStorage : ""

        if (sessionKey === "") {
            if (!router.pathname.startsWith("/login")) {
                router.push("/login").then()
            }
            return sessionKey
        }

        // Avoid calling /verify twice
        // verified gets set to false every page reload
        if (verified) {
            return sessionKey
        }

        verified = true
        return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `auth/osoc2 ${sessionKey}`
            }
        }).then(response => response.json()).then(response => {
            setIsAdmin(response.is_coach === true)
            setIsCoach(response.is_admin === true)
            if (!response.valid || response.account_status === AccountStatus.DISABLED) {
                if (!router.pathname.startsWith("/login")) {
                    router.push("/login")
                }
                setSessionKey("")
                return ""
            }
            if (response.account_status === AccountStatus.PENDING) {
                router.push("/pending")
                return ""
            }
            setSessionKey(sessionKey)
            return sessionKey
        }).catch(error => {
            console.log(error)
            setIsAdmin(false)
            setIsCoach(false)
            if (!router.pathname.startsWith("/login")) {
                router.push("/login")
            }
            setSessionKey("")
            return ""
        })
    }

    const setSessionKey = (sessionKey: string) => {
        setSessionKeyState(sessionKey)
        // Update localStorage
        localStorage.setItem('sessionKey', sessionKey)
    }

    const setIsCoach = (isCoach: boolean) => {
        setIsCoachState(isCoach)
        // Update localStorage
        localStorage.setItem('isCoach', String(isCoach))
    }

    const setIsAdmin = (isAdmin: boolean) => {
        setIsAdminState(isAdmin)
        // Update localStorage
        localStorage.setItem('isAdmin', String(isAdmin))
    }

    return (
        <SessionContext.Provider
            value={{sessionKey, getSessionKey, setSessionKey, isCoach, setIsCoach, isAdmin, setIsAdmin}}>
            {children}
        </SessionContext.Provider>
    );
};

export default SessionContext;
