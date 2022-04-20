import React, { createContext, ReactNode, useContext } from "react";
import { io } from "socket.io-client";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../types";

// the socket we are using with the right url to the server
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
    `${process.env.NEXT_PUBLIC_API_URL}`
);

// context that keeps track of the socket
const SocketsContext = createContext({ socket });

// provider for the socketcontext
export const SocketsProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    return (
        <SocketsContext.Provider value={{ socket }}>
            {children}
        </SocketsContext.Provider>
    );
};

export const useSockets = () => useContext(SocketsContext);
