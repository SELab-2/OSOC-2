import body from 'body-parser';
import express from 'express';

import * as config from './config.json';
import * as ep from './endpoints'
import * as util from './utility';
import cors from 'cors';
import { createServer } from "http";
import { Server } from "socket.io";

const app: express.Application = express();
const port: number = config.port;
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

app.use(body.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
app.use((req, _, next) => util.logRequest(req, next));
ep.attach(app);
config.global.homes.forEach(home => util.addInvalidVerbs(app, home + "/"));

io.on("connection", (socket) => {
    console.log("websocket connection achieved " + JSON.stringify(socket));
});
httpServer.listen(port, () => {
    console.log(`TypeScript with Express
          http://localhost:${port}/`);
});
