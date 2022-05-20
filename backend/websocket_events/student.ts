import { Server, Socket } from "socket.io";
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from "../types";
/* istanbul ignore file */

/**
 * function to register the listeners to the sockets.
 * This function is used/imported in the index.ts file
 * @param io: the io/server instance from socket.io
 * @param socket: the socket instance from the server
 */
export function registerStudentHandlers(
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
    const studentSuggestionCreated = (studentId: number) => {
        socket.broadcast.emit("studentSuggestionCreated", studentId);
    };

    socket.on("studentSuggestionSent", studentSuggestionCreated);
    socket.on("studentDecisionSent", studentSuggestionCreated);
}
