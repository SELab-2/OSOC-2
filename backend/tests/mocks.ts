import CallableInstance from 'callable-instance';
import express from 'express';
import core from 'express-serve-static-core';
import {setTimeout} from 'timers/promises';

type Call = (req: express.Request, res: express.Response,
             next: express.NextFunction) => Promise<void>;

class Callback {
  cb: Call|undefined;

  constructor() { this.cb = undefined; }
  public set(cb: Call) {
    if (this.cb === undefined)
      this.cb = cb;
  }
}

class CallbackCollection {
  get: Callback;
  put: Callback;
  post: Callback;
  delete: Callback;
  patch: Callback;

  constructor() {
    this.get = new Callback();
    this.put = new Callback();
    this.post = new Callback();
    this.delete = new Callback();
    this.patch = new Callback();
  }
}

export class RouterInvalidVerbError extends Error {}
export class RouterInvalidEndpointError extends Error {}
export class RouterInvalidVerbEndpointError extends Error {}

export class MockedRouter extends
    CallableInstance<[ express.Request, express.Response ], Promise<void>>
        implements express.Router {
  private verifier(route: string) {
    if (!(route in this.callbacks)) {
      this.callbacks[route] = new CallbackCollection();
    }
  }

  callbacks: {[key: string]: CallbackCollection} = {};

  all = ((pth: string, rt: express.RequestHandler) => {
          this.verifier(pth);
          this.get(pth, rt);
          this.post(pth, rt);
          this.put(pth, rt);
          this.delete(pth, rt);
          this.patch(pth, rt);
          return this;
        }) as core.IRouterMatcher<this, 'all'>;

  get = ((pth: string, rt: express.RequestHandler) => {
          this.verifier(pth);
          this.callbacks[pth].get.set(
              async (req, res, next) => { await rt(req, res, next); });
        }) as core.IRouterMatcher<this, 'get'>;

  post = ((pth: string, rt: express.RequestHandler) => {
           this.verifier(pth);
           this.callbacks[pth].post.set(
               async (req, res, next) => { await rt(req, res, next); });
         }) as core.IRouterMatcher<this, 'post'>;

  put = ((pth: string, rt: express.RequestHandler) => {
          this.verifier(pth);
          this.callbacks[pth].put.set(
              async (req, res, next) => { await rt(req, res, next); });
        }) as core.IRouterMatcher<this, 'put'>;

  delete = ((pth: string, rt: express.RequestHandler) => {
             this.verifier(pth);
             this.callbacks[pth].delete.set(
                 async (req, res, next) => { await rt(req, res, next); });
           }) as core.IRouterMatcher<this, 'delete'>;

  patch = ((pth: string, rt: express.RequestHandler) => {
            this.verifier(pth);
            this.callbacks[pth].patch.set(
                async (req, res, next) => { await rt(req, res, next); });
          }) as core.IRouterMatcher<this, 'patch'>;

  options = jest.fn();
  head = jest.fn();
  checkout = jest.fn();
  connect = jest.fn();
  copy = jest.fn();
  lock = jest.fn();
  merge = jest.fn();
  mkactivity = jest.fn();
  mkcol = jest.fn();
  move = jest.fn();
  'm-search' = jest.fn();
  notify = jest.fn();
  param = jest.fn();
  propfind = jest.fn();
  proppatch = jest.fn();
  purge = jest.fn();
  report = jest.fn();
  search = jest.fn();
  subscribe = jest.fn();
  trace = jest.fn();
  unlock = jest.fn();
  unsubscribe = jest.fn();
  use = jest.fn();
  route = jest.fn();
  stack = [];

  constructor() { super('__call__'); }

  // simple mocking
  public async __call__(req: express.Request, res: express.Response) {
    return Promise.resolve().then(async () => {
      const ep = req.path;
      const verb = req.method;

      if (!(ep in this.callbacks)) {
        throw getInvalidEndpointError(ep);
      }
      if (verb != 'get' && verb != 'post' && verb != 'put' &&
          verb != 'delete' && verb != 'patch') {
        throw getInvalidVerbError(verb);
      }
      const pVerb = verb as 'get' | 'post' | 'put' | 'delete' | 'patch';
      const cb = this.callbacks[ep][pVerb].cb;

      if (cb == undefined) {
        throw getInvalidVerbEndpointError(verb, ep);
      } else {
        console.log('[mockedRouter]: returning await...');
        return await Promise.resolve().then(
            async () => await cb(req, res, function() { /*do nothing*/ }));
      }
    });
  }
}

export function getMockRouter(): MockedRouter { return new MockedRouter(); }

export function getInvalidVerbError(verb: string) {
  return new RouterInvalidEndpointError('Invalid verb ' + verb);
}
export function getInvalidEndpointError(ep: string) {
  return new RouterInvalidEndpointError('Invalid endpoint ' + ep);
}
export function getInvalidVerbEndpointError(verb: string, ep: string) {
  return new RouterInvalidEndpointError(
      'Invalid verb/endpoint combination: ' + verb + " " + ep);
}

export type Method = 'get'|'post'|'put'|'patch'|'delete';

export type RouterPrepareCallback = (req: express.Request) => void;

export async function expectRouter(router: MockedRouter, path: string,
                                   method: Method, req: express.Request,
                                   res: express.Response) {
  req.path = path;
  req.method = method;
  await router(req, res);
  await setTimeout(1000);
}

export async function expectRouterThrow<T>(router: MockedRouter, path: string,
                                           method: Method, req: express.Request,
                                           res: express.Response, err: T) {
  req.path = path;
  req.method = method;
  return expect(expectRouter(router, path, method, req, res))
      .rejects.toStrictEqual(err);
}
