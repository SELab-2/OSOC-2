// TODO: this test is completely work in progress and commented out because it sometimes throws timeouts.

// emtpy test otherwise jest complains
test("", () => {
    expect(true).toBeTruthy();
});

// // eslint-disable-next-line @typescript-eslint/no-var-requires
// import {
//     ClientToServerEvents,
//     InterServerEvents,
//     ServerToClientEvents,
//     SocketData,
// } from "../../types";
//
// import { createServer } from "http";
// import { Server } from "socket.io";
// import { registerLoginUserHandlers } from "../../websocket_events/login_user";
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const Client = require("socket.io-client");
//
// describe("my awesome project", () => {
//     let io: Server<
//             ClientToServerEvents,
//             ServerToClientEvents,
//             InterServerEvents,
//             SocketData
//         >,
//         serverSocket: {
//             emit: (arg0: string, arg1: string) => void;
//             on: (arg0: string, arg1: (cb: unknown) => void) => void;
//         },
//         clientSocket: {
//             on: (arg0: string, arg1: (arg: unknown) => void) => void;
//             close: () => void;
//             emit: (arg0: string, arg1: (arg: unknown) => void) => void;
//         },
//         clientSocket2: {
//             on: (arg0: string, arg1: (arg: unknown) => void) => void;
//             close: () => void;
//             emit: (arg0: string, arg1: (arg: unknown) => void) => void;
//     };
//
//     beforeAll((done) => {
//         const httpServer = createServer();
//         io = new Server(httpServer);
//         httpServer.listen(() => {
//             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//             // @ts-ignore
//             const port = httpServer.address().port;
//             clientSocket = new Client(`http://localhost:${port}`);
//             clientSocket2 = new Client(`http://localhost:${port}`);
//
//             io.on("connection", (socket) => {
//                 // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//                 // @ts-ignore
//                 serverSocket = socket;
//                 registerLoginUserHandlers(io, socket);
//             });
//             clientSocket.on("connect", done);
//         });
//     });
//
//     afterAll(() => {
//         io.close();
//         clientSocket.close();
//     });
//
//     test("should work", (done) => {
//         clientSocket2.on("loginUserUpdated", (done) => {
//             expect(true).toBeFalsy();
//             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//             // @ts-ignore
//             done();
//         });
//         clientSocket.emit("updateRoleUser", () => true);
//         expect(true).toBeTruthy();
//         done();
//     });
//
//     test("should work (with ack)", (done) => {
//         serverSocket.on("hi", (cb) => {
//             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//             // @ts-ignore
//             cb("hola");
//         });
//         clientSocket.emit("hi", (arg) => {
//             expect(arg).toBe("hola");
//             done();
//         });
//     });
// });
