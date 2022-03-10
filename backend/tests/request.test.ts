import {getMockReq} from '@jest-mock/express';
import express from 'express';

import * as Rq from '../request'
import * as T from '../types';
import {errors} from '../utility';

test("Can parse Key-only requests", () => {
  var valid: express.Request = getMockReq();
  var invalid: express.Request = getMockReq();
  var wrongprop: express.Request = getMockReq();

  valid.body.sessionkey = "hello I am a key";
  wrongprop.body.key = "hello I am a key as well";

  const calls = [
    Rq.parseLogoutRequest, Rq.parseStudentAllRequest, Rq.parseCoachAllRequest,
    Rq.parseGetAllCoachRequestsRequest, Rq.parseAdminAllRequest,
    Rq.parseProjectAllRequest, Rq.parseConflictAllRequest,
    Rq.parseFollowupAllRequest, Rq.parseTemplateListRequest
  ];

  const successes =
      calls.map(call => expect(call(valid)).resolves.toStrictEqual({
        sessionkey : "hello I am a key"
      }));

  const failures = calls.flatMap(call => [call(invalid), call(wrongprop)])
                       .map(sub => expect(sub).rejects.toStrictEqual(
                                errors.cookArgumentError()));

  return Promise.all([ successes, failures ].flat());
});

test("Can parse Key-ID requests", () => {
  const res: T.Requests.IdRequest = {
    sessionkey : "Hello I am a key",
    id : "Hello I am an ID"
  };
  var valid: express.Request = getMockReq();
  var neither: express.Request = getMockReq();
  var onlyKey: express.Request = getMockReq();
  var onlyid: express.Request = getMockReq();

  valid.body.sessionkey = res.sessionkey;
  valid.params.id = res.id;
  onlyKey.body.sessionkey = res.sessionkey;
  onlyid.params.id = res.id;

  const calls = [
    Rq.parseSingleStudentRequest, Rq.parseDeleteStudentRequest,
    Rq.parseStudentGetSuggestsRequest, Rq.parseSingleCoachRequest,
    Rq.parseDeleteCoachRequest, Rq.parseGetCoachRequestRequest,
    Rq.parseAcceptNewCoachRequest, Rq.parseDenyNewCoachRequest,
    Rq.parseSingleAdminRequest, Rq.parseDeleteAdminRequest,
    Rq.parseSingleProjectRequest, Rq.parseDeleteProjectRequest,
    Rq.parseGetDraftedStudentsRequest, Rq.parseGetFollowupStudentRequest,
    Rq.parseGetTemplateRequest, Rq.parseDeleteTemplateRequest
  ];

  const successes =
      calls.map(call => expect(call(valid)).resolves.toStrictEqual(res));

  const failures =
      calls.flatMap(call => [call(neither), call(onlyKey), call(onlyid)])
          .map(sub => expect(sub).rejects.toStrictEqual(
                   errors.cookArgumentError()));

  return Promise.all([ successes, failures ].flat());
})

test("Can parse update login user requests", () => {
  const key: string = "key_u1";
  const id: string = "id____u1_____";

  const fillReq = (v: any) => {
    var r = getMockReq();
    r.params.id = v.id;
    r.body.sessionkey = v.sessionkey;
    ["emailOrGithub", "firstName", "lastName", "gender", "pass"].forEach(k => {
      if (k in v)
        r.body[k] = v[k]
    });
    return r;
  };

  const check =
      (v: T.Requests.UpdateLoginUser, og: T.Requests.UpdateLoginUser) => {
        expect(v.id).toBe(og.id);
        expect(v.sessionkey).toBe(og.sessionkey);
        expect(v.firstName).toBe(og.firstName);
        expect(v.lastName).toBe(og.lastName);
        expect(v.emailOrGithub).toBe(og.emailOrGithub);
        expect(v.pass).toBe(og.pass);
        expect(v.gender).toBe(og.gender);
      };

  const funcs = [ Rq.parseUpdateCoachRequest, Rq.parseUpdateAdminRequest ];

  const options = [
    {emailOrGithub : "user1@user2.be", id : id, sessionkey : key},
    {firstName : "User", id : id, sessionkey : key},
    {lastName : "One", id : id, sessionkey : key},
    {gender : "eno", id : id, sessionkey : key},
    {pass : "user1iscool", id : id, sessionkey : key},
    {gender : "eno", firstName : "Dead", id : id, sessionkey : key}, {
      emailOrGithub : "user-1_git",
      firstName : "Jef",
      lastName : "Pollaq",
      gender : "male",
      pass : "",
      id : id,
      sessionkey : key
    }
  ].map(v => ({val : fillReq(v), og : v}));

  const res: T.Requests.IdRequest = {
    sessionkey : "Hello I am a key",
    id : "Hello I am an ID"
  };

  var noupdate: express.Request = getMockReq();
  var neither: express.Request = getMockReq();
  var onlyKey: express.Request = getMockReq();
  var onlyid: express.Request = getMockReq();

  noupdate.body.sessionkey = res.sessionkey;
  noupdate.params.id = res.id;
  onlyKey.body.sessionkey = res.sessionkey;
  onlyid.params.id = res.id;

  const successes =
      options.flatMap(v => funcs.map(f => ({val : f(v.val), og : v.og})))
          .map(x => x.val.then(v => check(v, x.og)));

  const failures = [ noupdate, neither, onlyKey, onlyid ]
                       .flatMap(v => funcs.map(f => f(v)))
                       .map(x => {expect(x).rejects.toStrictEqual(
                                errors.cookArgumentError())});

  return Promise.all([ successes, failures ].flat());
});
