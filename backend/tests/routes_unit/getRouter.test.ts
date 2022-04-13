import {getMockReq, getMockRes} from '@jest-mock/express';
import * as express from 'express';

import * as config from '../../config.json';
import * as types from '../../types';
import * as util from '../../utility';
import * as rMock from '../mocks';

jest.mock('../../utility', () => {
  const og = jest.requireActual<typeof util>('../../utility');
  return {
    ...og,
    route : mockRoute,
    routeKeyOnly : mockRouteKeyOnly,
    addAllInvalidVerbs : mockAddAllInvalidVerbs,
    checkSessionKey : mockCheckSessionKey,
    isAdmin : mockCheckSessionKey
  };
})

jest.mock('express');
const expressMock = express as jest.Mocked<typeof express>;

import * as admin from '../../routes/admin';
jest.mock('../../routes/admin', () => {
  const og = jest.requireActual<typeof admin>('../../routes/admin');
  return {
    ...og,
    listAdmins : jest.fn(),
    getAdmin : jest.fn(),
    modAdmin : jest.fn(),
    deleteAdmin : jest.fn()
  };
});
const adminMock = admin as jest.Mocked<typeof admin>;

function mockRoute<T extends types.Responses.ApiResponse>(
    router: express.Router, verb: types.Verb, path: string,
    callback: types.RouteCallback<types.Responses.Keyed<T>>) {
  router[verb](path, (req: express.Request, res: express.Response) => {
    callback(req)
        .then(obj => {
          console.log('route [mocked]: sending HTTP 200, obj: ' +
                      JSON.stringify(obj));
          res.status(200);
          res.send(obj);
        })
        .catch(e => {
          console.log('route [mocked;error]: sending HTTP ' + e.http +
                      ', obj: ' + JSON.stringify(e));
          res.status(e.http);
          res.send(e);
        });
  });
}

function mockCheckSessionKey<T>(obj: T) { return Promise.resolve(obj); }

function mockRouteKeyOnly(router: express.Router, verb: types.Verb,
                          path: string,
                          callback: types.RouteCallback<types.Responses.Key>) {
  router[verb](path, (req, res) => {
    callback(req).then(obj => {
      console.log('routeKeyOnly [mocked]: sending HTTP 200, obj: ' +
                  JSON.stringify(obj));
      res.status(200);
      res.send(obj);
    });
  });
}

function mockAddAllInvalidVerbs(router: express.Router, eps: string[]) {
  eps.forEach(ep => router.all(ep, (req, res) => {
    const err = util.errors.cookInvalidVerb(req);
    res.status(err.http);
    res.send({reason : err.reason});
  }));
}

beforeEach(() => {
  expressMock.Router.mockImplementation(() => rMock.getMockRouter());
});

function setSessionKey(req: express.Request, key: string): void {
  req.headers.authorization = config.global.authScheme + " " + key;
}

function expectRedirect(res: express.Response, url: string) {
  expect(res.status).toBeCalledWith(303);
  expect(res.header).toBeCalledWith({'Location' : '/api-osoc/' + url + '/all'});
}

function expectStatusAndSend<T>(res: express.Response, status: number,
                                send: T) {
  console.log('Expecting status ' + status + ' and send ' +
              JSON.stringify(send));
  expect(res.status).toBeCalledWith(status);
  expect(res.send).toBeCalledWith(send);
}

function getPair(): {req: express.Request, res: express.Response} {
  return {req : getMockReq(), res : getMockRes().res};
}

test("admin.getRouter installs a correct router", async () => {
  // set up admin mock
  adminMock.listAdmins.mockReset();
  adminMock.listAdmins.mockImplementation(() => {
    console.log('[listAdmins]');
    return Promise.resolve({sessionkey : 'abcd', data : []});
  });
  adminMock.getAdmin.mockReset();
  adminMock.getAdmin.mockImplementation(() => {
    console.log('[getAdmin]');
    return Promise.reject({http : 410, reason : 'Deprecated endpoint.'});
  });
  adminMock.modAdmin.mockReset();
  adminMock.modAdmin.mockImplementation(() => {
    console.log('[modAdmin]');
    return Promise.resolve(
        {sessionkey : 'abcd', data : {id : 7, name : 'Jeffrey Jan'}});
  });
  adminMock.deleteAdmin.mockReset();
  adminMock.deleteAdmin.mockImplementation(() => {
    console.log('[deleteAdmin]');
    return Promise.resolve({sessionkey : 'abcd'});
  });

  // set up router
  const router = adminMock.getRouter() as rMock.MockedRouter;

  // actual checks
  await (async () => {
    const {req, res} = getPair();
    await rMock.expectRouterThrow(router, '/add', 'get', req, res,
                                  rMock.getInvalidEndpointError('/add'));
  })();

  await (async () => {
    const {req, res} = getPair();
    await rMock.expectRouter(router, '/', 'get', req, res);
    expectRedirect(res, 'admin');
  })();

  await (async () => {
    const {req, res} = getPair();
    setSessionKey(req, 'abcd');
    await rMock.expectRouter(router, '/all', 'get', req, res);
    expectStatusAndSend(res, 200, {sessionkey : 'abcd', data : []});
  })();
});
