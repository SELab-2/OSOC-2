import body from "body-parser";
import cors from "cors";
import express from "express";
import path from "path";
import * as config from "./config.json";
import * as ep from "./endpoints";
import * as util from "./utility";
import { createServer } from "http";
import { Server } from "socket.io";
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from "./types";
import { registerLoginUserHandlers } from "./websocket_events/login_user";

export const app: express.Application = express();
export const port: number = config.port;
export const httpServer = createServer(app);

// require makes it A LOT easier to use this. Import gives some weird behaviour
// that is not easy to work around
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config({
    path: path.join(__dirname, `./.env.${process.env.NODE_ENV}`),
});

const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>(httpServer, {
    cors: {
        origin: process.env.FRONTEND,
    },
    path: "/socket.io", // we locate the place for websockets at `/socket.io` inside the express server
});

app.use(body.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use((req, _, next) => util.logRequest(req, next));
app.use((req, _, next) => {
    util.queryToBody(req);
    next();
});
ep.attach(app);
config.global.homes.forEach((home) => util.addInvalidVerbs(app, home + "/"));

/**
 * install all the socket.io listeners.
 * We do this by using function "register...." that contain the listeners
 */
io.on("connection", (socket) => {
    registerLoginUserHandlers(io, socket);
});
