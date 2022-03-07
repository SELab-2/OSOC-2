import {getMockReq, getMockRes} from '@jest-mock/express';
import express from 'express';

import * as config from '../config.json';
import {ApiError} from '../types';
import * as util from '../utility';

interface Req {
  url: string, verb: string
}

function genPromises(): Promise<any>[] {
  const data: any[] = [
    6, "abc", {"key" : "value"},
    {"complex" : {"object" : "with", "array" : [ 1, 2, 3, 4 ]}}
  ];
  const promises: Promise<any>[] =
      data.map((val) => util.debug(val).then((res) => {
        expect(res).toBe(val);
        return res;
      }));
  return promises;
}

function obtainResponse() {
  const {res} = getMockRes();
  const statSpy = jest.spyOn(res, 'status');
  const sendSpy = jest.spyOn(res, 'send');
  return {res, statSpy, sendSpy};
}

test("utility.errors.cook* work as expected", () => {
  // easy ones
  expect(util.errors.cookInvalidID()).toBe(config.apiErrors.invalidID);
  expect(util.errors.cookArgumentError()).toBe(config.apiErrors.argumentError);
  expect(util.errors.cookUnauthenticated())
      .toBe(config.apiErrors.unauthenticated);
  expect(util.errors.cookInsufficientRights())
      .toBe(config.apiErrors.insufficientRights);
  expect(util.errors.cookServerError()).toBe(config.apiErrors.serverError);

  // annoying ones
  // non-existent endpoint
  const nonexistData: string[] =
      [ "/", "/login", "/student/684648a68498e9/suggest" ];
  const nonexistExpect: {url: string, err: ApiError}[] = nonexistData.map(
      url => ({
        url : url,
        err : {
          http : config.apiErrors.nonExistent.http,
          reason : config.apiErrors.nonExistent.reason.replace(/$url/, url)
        }
      }));
  nonexistExpect.forEach(
      val =>
          expect(util.errors.cookNonExistent(val.url)).toStrictEqual(val.err));

  // invalid verb
  const verbs: Req[] = [
    {verb : "GET", url : "/"}, {verb : "POST", url : "/students/all"},
    {verb : "DELETE", url : "/coach/all"}, {verb : "PUT", url : "/login"},
    {verb : "HEAD", url : "/admin/all"},
    {verb : "OPTIONS", url : "/student/abcdeabcde"}
  ];
  const verbExpect: {err: ApiError, req: express.Request}[] = verbs.map(v => {
    var req: express.Request = getMockReq();
    req.method = v.verb;
    req.url = v.url;
    const msg = config.apiErrors.invalidVerb.reason.replace(/$url/, v.url)
                    .replace(/$verb/, v.verb);
    return {
      err : {http : config.apiErrors.invalidVerb.http, reason : msg},
      req : req
    };
  });
  verbExpect.forEach(
      v => expect(util.errors.cookInvalidVerb(v.req)).toStrictEqual(v.err));

  // non json
  const mimes: string[] =
      [ 'text/html', 'audio/aac', 'image/bmp', 'text/css', 'video/mp4' ];
  const mimeExpect: {err: ApiError, mime: string}[] = mimes.map(
      mime => ({
        mime : mime,
        err : {
          http : config.apiErrors.nonJSONRequest.http,
          reason : config.apiErrors.nonJSONRequest.reason.replace(/$mime/, mime)
        }
      }));
  mimeExpect.forEach(
      m => expect(util.errors.cookNonJSON(m.mime)).toStrictEqual(m.err));
});

test("utility.debug returns identical",
     () => { return Promise.all(genPromises()); });

test("utility.debug logs their data", () => {
  const logSpy = jest.spyOn(console, 'log');
  return Promise.all(genPromises().map(
      it => it.then((val) => expect(logSpy).toHaveBeenCalledWith(val))));
});

test("utility.reply writes to a response", () => {
  const data: {status: number, data: any}[] = [
    {status : 200, data : "success!"}, {status : 405, data : "invalid"},
    {status : 200, data : {using : "some", kind : {of : "data"}}}
  ];

  const {res, statSpy, sendSpy} = obtainResponse();

  const promises: Promise<void>[] =
      data.map(data => util.reply(res, data.status, data.data).then(() => {
        expect(sendSpy).toBeCalledWith(data.data);
        expect(statSpy).toBeCalledWith(data.status);
      }));
  return Promise.all(promises);
});

test("utility.replyError writes to a response", () => {
  // load api errors
  const someUrls: string[] = [ "/", "/logout", "/signup" ];
  const someVerbs: Req[] = [
    {verb : "PUT", url : "/"}, {verb : "OPTIONS", url : "/login"},
    {verb : "DELETE", url : "/student/all"}
  ];
  const someReqs: express.Request[] = someVerbs.map(req => {
    var request: express.Request = getMockReq();
    request.method = req.verb;
    request.url = req.url;
    return request;
  });
  const someMimes: string[] =
      [ 'text/html', 'audio/aac', 'image/bmp', 'text/css', 'video/mp4' ];

  var errors: ApiError[] = [
    util.errors.cookInvalidID(), util.errors.cookArgumentError(),
    util.errors.cookUnauthenticated(), util.errors.cookInsufficientRights(),
    util.errors.cookServerError()
  ];
  someUrls.forEach(url => errors.push(util.errors.cookNonExistent(url)));
  someReqs.forEach(req => errors.push(util.errors.cookInvalidVerb(req)));
  someMimes.forEach(mime => errors.push(util.errors.cookNonJSON(mime)));

  // run tests
  errors.forEach(err => {
    const {res, statSpy, sendSpy} = obtainResponse();
    const datafield: any = {success : false, reason : err.reason};
    util.replyError(res, err).then(() => {
      expect(statSpy).toBeCalledWith(err.http);
      expect(sendSpy).toBeCalledWith(datafield);
    });
  });
});

test("utility.replySuccess writes to a response", () => {
  const successes: any[] = [];

  successes.forEach(succ => {
    const {res, statSpy, sendSpy} = obtainResponse();
    util.replySuccess(res, succ).then(() => {
      succ.success = true;
      expect(statSpy).toBeCalledWith(200);
      expect(sendSpy).toBeCalledWith(succ);
    });
  });
});

test("utility.addInvalidVerbs adds verbs", () => {
  var router: express.Router = express.Router();
  const routerSpy = jest.spyOn(router, 'all');
  util.addInvalidVerbs(router, '/');
  // we seem unable to trigger the route with jest?
  // please someone check this?
  expect(routerSpy).toHaveBeenCalledTimes(1);
});

test("utility.logRequest logs request and passes control", () => {
  const writeSpy = jest.spyOn(console, "log");
  const request: express.Request = getMockReq();
  const callback = jest.fn(
      () => { expect(writeSpy).toHaveBeenCalledWith("GET /student/all"); });
  request.method = "GET";
  request.url = "/student/all";
  util.logRequest(request, callback);
  expect(callback).toHaveReturnedTimes(1);
});

test("utility.respOrErrorNoReinject sends successes", () => {
  // positive case
  const {res, statSpy, sendSpy} = obtainResponse();
  var obj:
      any = {data : {"some" : "data"}, "sessionkey" : "updated-session-key"};
  util.respOrErrorNoReinject(res, Promise.resolve(obj)).then(() => {
    obj.success = true;
    expect(statSpy).toHaveBeenCalledWith(200);
    expect(sendSpy).toHaveBeenCalledWith(obj);
  });
});

test("utility.respOrErrorNoReinject sends api errors", () => {
  // api error case
  const {res, statSpy, sendSpy} = obtainResponse();
  var err: ApiError = util.errors.cookArgumentError();
  var errObj: any = {success : false, reason : err.reason};
  util.respOrErrorNoReinject(res, Promise.reject(err)).then(() => {
    expect(statSpy).toHaveBeenCalledWith(err.http);
    expect(sendSpy).toHaveBeenCalledWith(errObj);
  });
});

test("utility.respOrErrorNoReinject sends generic errors as server errors",
     () => {
       const {res, statSpy, sendSpy} = obtainResponse();
       const writeSpy = jest.spyOn(console, "log");
       const error = {msg : "some", error : {"generic" : true}};
       const send = {
         success : false,
         reason : config.apiErrors.serverError.reason
       };
       util.respOrErrorNoReinject(res, Promise.reject(error)).then(() => {
         expect(statSpy).toHaveBeenCalledWith(
             config.apiErrors.serverError.http);
         expect(sendSpy).toHaveBeenCalledWith(send);
         expect(writeSpy).toHaveBeenCalledWith("UNCAUGHT ERROR " +
                                               JSON.stringify(error));
       });
     });

// test respOrError<T> has to wait -> ORM connection has to be mocked

test("utility.redirect sends an HTTP 303", () => {
  const {res, statSpy, sendSpy} = obtainResponse();
  const headerSpy = jest.spyOn(res, 'header');
  util.redirect(res, '/some/other/url').then(() => {
    expect(statSpy).toHaveBeenCalledWith(303);
    expect(sendSpy).toHaveBeenCalledTimes(1); // no args
    expect(headerSpy).toHaveBeenCalledWith({Location : '/some/other/url'});
  });
});

// test checkSessionKey has to wait -> ORM connection has to be mocked
// test isAdmin has to wait -> ORM connection has to be mocked
// test refreshKey has to wait -> ORM connection has to be mocked
// test refreshAndInjectKey has to wait -> ORM connection has to be mocked
