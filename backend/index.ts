import body from 'body-parser';
import express from 'express';

import * as config from './config.json';
import * as ep from './endpoints'
import * as util from './utility';
import cors from 'cors';

const app: express.Application = express();
const port: number = config.port;

app.use(body.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());
app.use((req, _, next) => util.logRequest(req, next));
ep.attach(app);
config.global.homes.forEach(home => util.addInvalidVerbs(app, home + "/"));

// Server setup
app.listen(port, () => {
    console.log(`TypeScript with Express
         http://localhost:${port}/`);
});
