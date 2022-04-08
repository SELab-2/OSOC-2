import body from 'body-parser';
import express from 'express';

import * as config from './config.json';
import * as ep from './endpoints'
import * as util from './utility';
import cors from 'cors';
import { createServer } from "http";
import { Server } from "socket.io";
import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData} from "./types";
import path from "path";

const app: express.Application = express();
const port: number = config.port;
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
    cors: {
        origin: "http://localhost:3000"
    }
});

// require makes it A LOT easier to use this. Import gives some weird behaviour that is not easy to work around
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: path.join(__dirname, `./.env.${process.env.NODE_ENV}`)});

app.use(body.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
app.use((req, _, next) => util.logRequest(req, next));
ep.attach(app);
config.global.homes.forEach(home => util.addInvalidVerbs(app, home + "/"));

io.on("connection", (socket) => {
    console.log("websocket connection achieved " + socket.id);
});
httpServer.listen(port, () => {
    console.log(`TypeScript with Express
<<<<<<< HEAD
          http://localhost:${port}/`);
});