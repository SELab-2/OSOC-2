import { Server, Socket } from "socket.io";
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from "../types";
/* istanbul ignore file */ // don't test this file because there is no real logic. Only the setup of listeners.
/**
 * function to register the listeners to the sockets.
 * This function is used/imported in the index.ts file
 * @param io: the io/server instance from socket.io
 * @param socket: the socket instance from the server
 */
export function registerProjectHandlers(
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
    const projectCreatedOrDeleted = () => {
        socket.broadcast.emit("projectWasCreatedOrDeleted");
    };
    const projectModified = (projectId: number) => {
        socket.broadcast.emit("projectWasModified", projectId);
    };

    socket.on("projectCreated", projectCreatedOrDeleted);
    socket.on("projectModified", projectModified);
    socket.on("coachAssignedToProjectChange", projectModified);
    socket.on("studentAssignedToProjectChange", projectModified);
    socket.on("projectDeleted", projectCreatedOrDeleted);
}
