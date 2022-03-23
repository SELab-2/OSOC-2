import express from 'express';

import * as config from './config.json';
import * as admin from './routes/admin';
import * as coach from './routes/coach';
import * as form from './routes/form';
import * as login from './routes/login';
import * as project from './routes/project';
import * as student from './routes/student';
import * as util from './utility';

/**
 *  Attaches all endpoints to the application.
 *  @param app The Express.js application to attach to.
 */
export function attach(app: express.Application): void {
  config.global.homes.forEach(home => {
    app.use(home + '/login', login.getRouter());
    app.use(home + '/student', student.getRouter());
    app.use(home + '/coach', coach.getRouter());
    app.use(home + '/admin', admin.getRouter());
    app.use(home + '/project', project.getRouter());
    app.use(home + '/form', form.getRouter);
  });

  app.use((req: express.Request, res: express.Response): Promise<void> =>
              util.replyError(res, util.errors.cookNonExistent(req.url)));
}
