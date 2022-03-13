import express from 'express';

import * as login from './routes/login';
import * as student from './routes/student';
import * as util from './utility';

/**
 *  Attaches all endpoints to the application.
 *  @param app The Express.js application to attach to.
 */
export function attach(app: express.Application): void {
  app.use('/login', login.getRouter());
  app.use('/student', student.getRouter());

  app.use((req: express.Request, res: express.Response): Promise<void> =>
              util.replyError(res, util.errors.cookNonExistent(req.url)));
}
