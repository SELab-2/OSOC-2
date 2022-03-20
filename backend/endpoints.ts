import express from 'express';

import * as login from './routes/login';
import * as student from './routes/student';
import * as coach from './routes/coach';
import * as admin from './routes/admin';
import * as project from './routes/project';
import * as form from './routes/form';
import * as util from './utility';

/**
 *  Attaches all endpoints to the application.
 *  @param app The Express.js application to attach to.
 */
export function attach(app: express.Application): void {
  app.use('/login', login.getRouter());
  app.use('/student', student.getRouter());
  app.use('/coach', coach.getRouter());
  app.use('/admin', admin.getRouter());
  app.use('/project', project.getRouter());
  app.use('/form', form.getRouter);

  app.use((req: express.Request, res: express.Response): Promise<void> =>
              util.replyError(res, util.errors.cookNonExistent(req.url)));
}