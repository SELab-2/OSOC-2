import CallableInstance from 'callable-instance';
import express from 'express';
import core from 'express-serve-static-core';

class Callback {
  cb: express.RequestHandler|undefined;

  constructor() { this.cb = undefined; }
  public set(cb: express.RequestHandler) {
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

class MockedRouter extends
    CallableInstance<[ express.Request, express.Response ], void> implements
        express.Router {
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
          this.callbacks[pth].get.set(rt);
        }) as core.IRouterMatcher<this, 'get'>;

  post = ((pth: string, rt: express.RequestHandler) => {
           this.verifier(pth);
           this.callbacks[pth].post.set(rt);
         }) as core.IRouterMatcher<this, 'post'>;

  put = ((pth: string, rt: express.RequestHandler) => {
          this.verifier(pth);
          this.callbacks[pth].put.set(rt);
        }) as core.IRouterMatcher<this, 'put'>;

  delete = ((pth: string, rt: express.RequestHandler) => {
             this.verifier(pth);
             this.callbacks[pth].delete.set(rt);
           }) as core.IRouterMatcher<this, 'delete'>;

  patch = ((pth: string, rt: express.RequestHandler) => {
            this.verifier(pth);
            this.callbacks[pth].patch.set(rt);
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
  public __call__(req: express.Request, res: express.Response) {
    const ep = req.path;
    const verb = req.method;

    if (!(ep in this.callbacks)) {
      throw Error('Invalid endpoint ' + ep);
    }
    if (verb != 'get' && verb != 'post' && verb != 'put' && verb != 'delete' &&
        verb != 'patch') {
      throw Error('Invalid verb ' + verb);
    }
    const pVerb = verb as 'get' | 'post' | 'put' | 'delete' | 'patch';
    const cb = this.callbacks[ep][pVerb].cb;

    if (cb == undefined) {
      throw Error('Invalid verb/endpoint combination: ' + pVerb + ' ' + ep);
    } else {
      cb(req, res, function() { /*do nothing*/ });
    }
  }
}

export function getMockRouter(): MockedRouter { return new MockedRouter(); }
