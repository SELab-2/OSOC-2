import { Server, Socket } from "socket.io";
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from "../types";

/**
 * function to register the listeners to the sockets.
 * This function is used/imported in the index.ts file
 * @param io: the io/server instance from socket.io
 * @param socket: the socket instance from the server
 */
export function registerLoginUserHandlers(
    io: Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >,
    socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >
) {
    const loginUserRoleUpdated = () => {
        socket.broadcast.emit("loginUserUpdated");
    };
    const loginUserActivated = () => {
        console.log("activated user!");
        socket.broadcast.emit("loginUserActivated");
    };
    const loginUserDisabled = () => {
        socket.broadcast.emit("loginUserDisabled");
    };
    socket.on("updateRoleUser", loginUserRoleUpdated);
    socket.on("activateUser", loginUserActivated);
    socket.on("disableUser", loginUserDisabled);
}
