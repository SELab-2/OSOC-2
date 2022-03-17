import {getMockReq, getMockRes} from '@jest-mock/express';
import express from 'express';

import * as config from '../config.json';
import {ApiError} from '../types';
import * as util from '../utility';

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
  const verbs: {verb: string, url: string}[] = [
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
  const {res} = getMockRes();

  const data: {status: number, data: any}[] = [
    {status : 200, data : "success!"}, {status : 405, data : "invalid"},
    {status : 200, data : {using : "some", kind : {of : "data"}}}
  ];

  const writeSpy = jest.spyOn(res, 'send');
  const statusSpy = jest.spyOn(res, 'status');

  const promises: Promise<void>[] =
      data.map(data => util.reply(res, data.status, data.data).then(() => {
        expect(writeSpy).toBeCalledWith(data.data);
        expect(statusSpy).toBeCalledWith(data.status);
      }));
  return Promise.all(promises);
});

// test("utility.replyError writes to a response")
