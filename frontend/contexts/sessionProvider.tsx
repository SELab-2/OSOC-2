import React, { createContext, useState } from 'react';

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

export const SessionProvider: React.FC = ({ children }) => {
    const [sessionKey, setSessionKey] = useState<string>("");
    const [isCoach, setIsCoach] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);


    return (
        <SessionContext.Provider value={{sessionKey, setSessionKey, isCoach, setIsCoach, isAdmin, setIsAdmin}}>
            {children}
        </SessionContext.Provider>
    );
};

export default SessionContext;
