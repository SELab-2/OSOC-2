import express from 'express';

import * as login from './routes/login';
import * as util from './utility'

// attach endpoints
export function attach(app: express.Application): void {
  app.use('/login', login.getRouter());

  app.use((req: express.Request, res: express.Response): Promise<void> =>
              util.replyError(res, util.errors.cookNonExistent(req.url)));
}
