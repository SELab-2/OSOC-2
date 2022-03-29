import React, { createContext, useState } from 'react';


interface ISessionContext {
    sessionKey: string;
    setSessionKey?: (key: string) => void
}

const defaultState = {
    sessionKey: ""
}


// eslint-disable-next-line no-unused-vars
const SessionContext = createContext<ISessionContext>(defaultState);

export const SessionProvider: React.FC = ({ children }) => {
    const [sessionKey, setSessionKey] = useState<string>("");


    return (
        <SessionContext.Provider value={{sessionKey, setSessionKey}}>
            {children}
        </SessionContext.Provider>
    );
};

export default SessionContext;
