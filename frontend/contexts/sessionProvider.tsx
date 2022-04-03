import React, {createContext, useEffect, useState} from 'react';

/**
 * Interface for the context, stores the user session application wide
 */
interface ISessionContext {
    sessionKey: string;
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
 * The sesssion provider is responsible for storing the user session both at runtime and in cookies
 * The session prodiver also reads all cookies upon reload
 * @param children
 * @constructor
 */
export const SessionProvider: React.FC = ({ children }) => {

    /**
     *
     */
    useEffect(() => {
        const allCookies = document.cookie.split(';').reduce((res, cookie) => {
            const [key, value] = cookie.trim().split('=')
            try {
                return Object.assign(res, { [key]: JSON.parse(value) })
            } catch (e) {
                return Object.assign(res, {[key]: value})
            }
        }, {});
        const cookies = allCookies as {sessionKey: string, isAdmin: boolean, isCoach: boolean}
        setSessionKeyState(cookies.sessionKey)
        setIsAdminState(cookies.isAdmin)
        setIsCoachState(cookies.isCoach)
    }, [])

    const [sessionKey, setSessionKeyState] = useState<string>("");
    const [isCoach, setIsCoachState] = useState<boolean>(false);
    const [isAdmin, setIsAdminState] = useState<boolean>(false);

    const setSessionKey = (sessionKey: string) => {
        setSessionKeyState(sessionKey)
        // Set a new cookie for the session key with max age of 1 day
        document.cookie = `sessionKey=${sessionKey};samesite=strict;max-age=86400`
    }

    const setIsCoach = (isCoach: boolean) => {
        setIsCoachState(isCoach)
        // Set a new cookie for the coach state with max age of 1 day
        document.cookie = `isCoach=${isCoach};samesite=strict;max-age=86400`
    }

    const setIsAdmin = (isAdmin: boolean) => {
        setIsAdminState(isAdmin)
        // Set a new cookie for the admin state with max age of 1 day
        document.cookie = `isAdmin=${isAdmin};samesite=strict;max-age=86400`
    }

    return (
        <SessionContext.Provider value={{sessionKey, setSessionKey, isCoach, setIsCoach, isAdmin, setIsAdmin}}>
            {children}
        </SessionContext.Provider>
    );
};

export default SessionContext;
