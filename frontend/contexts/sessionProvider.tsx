import React, {createContext, ReactNode, useEffect, useState} from 'react';

/**
 * Interface for the context, stores the user session application wide
 */
interface ISessionContext {
    sessionKey: string
    getSessionKey?: () => string;
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
export const SessionProvider: React.FC<{children: ReactNode}> = ({ children }) => {

    /**
     * Everytime the page is reloaded we need to get the session from local storage
     */
    useEffect(() => {
        const sessionKey = localStorage.getItem('sessionKey')
        setSessionKeyState(sessionKey !== null ? sessionKey : "")
        setIsAdminState(localStorage.getItem('isAdmin') === 'true')
        setIsCoachState(localStorage.getItem('isCoach') === 'true')
    }, [])

    const [sessionKey, setSessionKeyState] = useState<string>("");
    const [isCoach, setIsCoachState] = useState<boolean>(false);
    const [isAdmin, setIsAdminState] = useState<boolean>(false);

    /**
     * The useEffect is not always called before other page's use effect
     * Therefore we can use this function to get the sessionkey in the useEffect functions
     */
    const getSessionKey = () => {
        if (sessionKey != undefined && sessionKey != "") {
            return sessionKey
        }

        const key = localStorage.getItem('sessionKey')
        return key !== null ? key : ""
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
        <SessionContext.Provider value={{sessionKey, getSessionKey, setSessionKey, isCoach, setIsCoach, isAdmin, setIsAdmin}}>
            {children}
        </SessionContext.Provider>
    );
};

export default SessionContext;
