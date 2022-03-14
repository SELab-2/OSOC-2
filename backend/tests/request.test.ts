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
                                errors.cookUnauthenticated()));

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

test("Can parse login request", () => {
  var valid: express.Request = getMockReq();
  var noname: express.Request = getMockReq();
  var nopass: express.Request = getMockReq();

  valid.body.name = "Name #1";
  valid.body.pass = "Pass #1";
  noname.body.pass = "Pass #2";
  nopass.body.name = "Name #2";

  return Promise.all([
    expect(Rq.parseLoginRequest(valid))
        .resolves.toStrictEqual({name : "Name #1", pass : "Pass #1"}),
    expect(Rq.parseLoginRequest(noname))
        .rejects.toBe(errors.cookArgumentError()),
    expect(Rq.parseLoginRequest(nopass))
        .rejects.toBe(errors.cookArgumentError())
  ]);
})

test("Can parse new student request", () => {
  var dataV = {
    sessionkey : "abcdef",
    emailOrGithub : "ab@c.de",
    firstName : "ab",
    lastName : "c",
    gender : "Apache Attack Helicopter",
    pronouns : "vroom/vroom",
    phone : "+32420 696969",
    education : {
      level : 7,
      duration : 9,
      year : "something?!?!?",
      institute : "KULeuven"
    }
  };

  var failure1 = {
    sessionkey : "abcdef",
    emailOrGithub : "ab@c.de",
    firstName : "ab", // no last name
    gender : "Apache Attack Helicopter",
    pronouns : "vroom/vroom",
    phone : "+32420 696969",
    education : {
      level : 7,
      duration : 9,
      year : "something?!?!?",
      institute : "KULeuven"
    }
  };

  var failure2 = {
    sessionkey : "abcdef",
    emailOrGithub : "ab@c.de",
    firstName : "ab",
    lastName : "c",
    gender : "Apache Attack Helicopter",
    pronouns : "vroom/vroom",
    phone : "+32420 696969",
    education : {
      level : 7, // missing duration
      year : "something?!?!?",
      institute : "KULeuven"
    }
  };

  var valid: express.Request = getMockReq();
  var ival1: express.Request = getMockReq();
  var ival2: express.Request = getMockReq();

  valid.body = {...dataV}; // spread = copy
  ival1.body = {...failure1};
  ival2.body = {...failure2};

  const error = errors.cookArgumentError();

  return Promise.all([
    expect(Rq.parseNewStudentRequest(valid)).resolves.toStrictEqual(dataV),
    expect(Rq.parseNewStudentRequest(ival1)).rejects.toStrictEqual(error),
    expect(Rq.parseNewStudentRequest(ival2)).rejects.toStrictEqual(error)
  ]);
});

test("Can parse update student request", () => {
  var dataV: any = {
    sessionkey : "abcdef",
    emailOrGithub : "ab@c.de",
    firstName : "ab",
    lastName : "c",
    gender : "Apache Attack Helicopter",
    pronouns : "vroom/vroom",
    phone : "+32420 696969",
    education : {
      level : 7,
      duration : 9,
      year : "something?!?!?",
      institute : "KULeuven"
    }
  };

  var failure1: any = {
    sessionkey : "abcdef",
    emailOrGithub : "ab@c.de",
    firstName : "ab", // no last name
    gender : "Apache Attack Helicopter",
    pronouns : "vroom/vroom",
    phone : "+32420 696969",
    education : {
      level : 7,
      duration : 9,
      year : "something?!?!?",
      institute : "KULeuven"
    }
  };

  var failure2: any = {
    sessionkey : "abcdef",
    emailOrGithub : "ab@c.de",
    firstName : "ab",
    lastName : "c",
    gender : "Apache Attack Helicopter",
    pronouns : "vroom/vroom",
    phone : "+32420 696969",
    education : {
      level : 7, // missing duration
      year : "something?!?!?",
      institute : "KULeuven"
    }
  };

  var failure3: any = {sessionkey : "abcdef"};

  var id = "id-0011223369";

  var valid: express.Request = getMockReq();
  var ival1: express.Request = getMockReq();
  var ival2: express.Request = getMockReq();
  var ival3: express.Request = getMockReq();

  valid.body = {...dataV};
  valid.params.id = id;
  ival1.body = {...failure1};
  ival1.params.id = id;
  ival2.body = {...failure2};
  ival2.params.id = id;
  ival3.body = {...failure3};
  ival3.params.id = id;

  dataV.id = id;
  failure1.id = id;
  failure1.lastName = undefined;
  failure2.id = id;
  failure2.education.duration = undefined;

  const error = errors.cookArgumentError();

  return Promise.all([
    expect(Rq.parseUpdateStudentRequest(valid)).resolves.toStrictEqual(dataV),
    expect(Rq.parseUpdateStudentRequest(ival1))
        .resolves.toStrictEqual(failure1),
    expect(Rq.parseUpdateStudentRequest(ival2))
        .resolves.toStrictEqual(failure2),
    expect(Rq.parseUpdateStudentRequest(ival3)).rejects.toStrictEqual(error)
  ]);
});

test("Can parse suggest student request", () => {
  const key: string = "my-session-key";
  const id: string = "id-abcde";
  var ys: any = {suggestion : "YES", sessionkey : key};
  var mb: any = {suggestion : "MAYBE", sessionkey : key};
  var no: any = {suggestion : "NO", sessionkey : key};
  var nr: any = {
    suggestion : "NO",
    reason : "I just don't like you",
    sessionkey : key
  };
  var i1: any = {suggestion : "TOMORROW", sessionkey : key};
  var i2: any = {suggestion : "no", sessionkey : key}; // no caps
  var i3: any = {sessionkey : key};

  const okays = [ ys, mb, no, nr ].map(x => {
    var copy: any = {...x};
    copy.id = id;
    var req: express.Request = getMockReq();
    req.params.id = id;
    req.body = x;
    if (!("reason" in req.body))
      copy.reason = undefined;
    return expect(Rq.parseSuggestStudentRequest(req))
        .resolves.toStrictEqual(copy);
  });

  const fails = [ i1, i2, i3 ].map(x => {
    var req: express.Request = getMockReq();
    req.params.id = id;
    req.body = {...x};
    return expect(Rq.parseSuggestStudentRequest(req))
        .rejects.toBe(errors.cookArgumentError());
  });

  return Promise.all([ okays, fails ].flat());
});

test("Can parse final decision request", () => {
  const key: string = "key";
  const id: string = "id6969420420";
  var data: any = {sessionkey : key};
  var dat2: any = {reply : "YES", sessionkey : key};
  var dat3: any = {reply : "NO", sessionkey : key};
  var dat4: any = {reply : "MAYBE", sessionkey : key};
  var dat5: any = {reply : "something", sessionkey : key};
  var dat6: any = {reply : "maybe", sessionkey : key};
  var dat7: any = {reply : "YES"};

  var p = [ data, dat2, dat3, dat4 ].map(x => {
    var r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id;
    x.id = id;
    if (!("reply" in x))
      x.reply = undefined;

    return expect(Rq.parseFinalizeDecisionRequest(r)).resolves.toStrictEqual(x);
  });

  var q = [ dat5, dat6, dat7 ].map(x => {
    var r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id;
    x.id = id;
    return expect(Rq.parseFinalizeDecisionRequest(r))
        .rejects.toBe(errors.cookArgumentError());
  });

  return Promise.all([ p, q ].flat());
});

test("Can parse coach access request", () => {
  var r1: any = {
    firstName : "Jeff",
    lastName : "Georgette",
    emailOrGithub : "idonthavegithub@git.hub",
    pass : "thisismypassword",
    gender : "male"
  };

  var r2: any = {
    firstName : "Jeff",
    lastName : "Georgette",
    emailOrGithub : "idonthavegithub@git.hub",
    gender : "male"
  };

  var req1: express.Request = getMockReq();
  req1.body = {...r1};

  var req2: express.Request = getMockReq();
  req2.body = {...r2};
  r2.pass = undefined;

  var req3: express.Request = getMockReq();
  req3.body = {};

  var prom1: Promise<void> =
      expect(Rq.parseRequestCoachRequest(req1)).resolves.toStrictEqual(r1);
  var prom2: Promise<void> =
      expect(Rq.parseRequestCoachRequest(req2)).resolves.toStrictEqual(r2);
  var prom3: Promise<void> = expect(Rq.parseRequestCoachRequest(req3))
                                 .rejects.toBe(errors.cookArgumentError());

  return Promise.all([ prom1, prom2, prom3 ]);
});

test("Can parse new project request", () => {
  const key: string = "abcdefghijklmnopqrstuvwxyz";
  var d1: any = {
    sessionkey : key,
    name : "Experiment One",
    partner : "Simic Combine",
    start : Date.now(),
    end : Date.now(),
    positions : 69
  };
  var d2: any = {sessionkey : key};
  var d3: any = {
    name : "Experiment One",
    partner : "Simic Combine",
    start : Date.now(),
    end : Date.now(),
    positions : 420
  };

  var req1: express.Request = getMockReq();
  var req2: express.Request = getMockReq();
  var req3: express.Request = getMockReq();

  req1.body = {...d1};
  req2.body = {...d2};
  req3.body = {...d3};

  var p1: Promise<void> =
      expect(Rq.parseNewProjectRequest(req1)).resolves.toStrictEqual(d1);
  var p2: Promise<void> = expect(Rq.parseNewProjectRequest(req2))
                              .rejects.toBe(errors.cookArgumentError());
  var p3: Promise<void> = expect(Rq.parseNewProjectRequest(req3))
                              .rejects.toBe(errors.cookArgumentError());

  return Promise.all([ p1, p2, p3 ]);
});

test("Can parse update project request", () => {
  const key: string = "abcdefghijklmnopqrstuvwxyz";
  const id: string = "zyxwvutsrqponmlkjihgfedcba";
  var d1: any = {
    sessionkey : key,
    name : "Experiment One",
    partner : "Simic Combine",
    start : Date.now(),
    end : Date.now(),
    positions : 69
  };
  var d2: any = {sessionkey : key};
  var d3: any = {
    sessionkey : key,
    name : "Experiment One",
    partner : "Simic Combine",
    start : Date.now(),
    positions : 420
  };
  var d4: any = {
    name : "Experiment One",
    partner : "Simic Combine",
    start : Date.now(),
    end : Date.now(),
    positions : 69
  };

  var req1: express.Request = getMockReq();
  var req2: express.Request = getMockReq();
  var req3: express.Request = getMockReq();
  var req4: express.Request = getMockReq();
  var req5: express.Request = getMockReq();

  req1.body = {...d1};
  req1.params.id = id;
  req2.body = {...d2};
  req2.params.id = id;
  req3.body = {...d3};
  req3.params.id = id;
  req4.body = {...d4};
  req4.params.id = id;
  req5.body = {...d1};

  d1.id = id;
  d2.id = id;
  d3.id = id;
  d3.end = undefined;
  d4.id = id;

  var p1: Promise<void> =
      expect(Rq.parseUpdateProjectRequest(req1)).resolves.toStrictEqual(d1);
  var p2: Promise<void> = expect(Rq.parseUpdateProjectRequest(req2))
                              .rejects.toBe(errors.cookArgumentError());
  var p3: Promise<void> =
      expect(Rq.parseUpdateProjectRequest(req3)).resolves.toStrictEqual(d3);
  var p4: Promise<void> = expect(Rq.parseUpdateProjectRequest(req4))
                              .rejects.toBe(errors.cookArgumentError());

  return Promise.all([ p1, p2, p3, p4 ]);
});

test("Can parse draft student request", () => {
  const key: string = "keyyyyy";
  const id: string = "iiiiiiid";

  var d1: any = {
    sessionkey : key,
    studentId : "im-a-student",
    roles : [ "the", "one", "that", "does", "nothing" ]
  };
  var d2: any = {sessionkey : key, studentId : "im-a-student"};
  var d3: any = {
    studentId : "im-a-student",
    roles : [ "the", "one", "that", "does", "nothing" ]
  };

  var r1: express.Request = getMockReq();
  var r2: express.Request = getMockReq();
  var r3: express.Request = getMockReq();
  var r4: express.Request = getMockReq();

  r1.body = {...d1};
  r2.body = {...d2};
  r3.body = {...d3};
  r4.body = {...d1};

  r1.params.id = id;
  r2.params.id = id;
  r3.params.id = id;

  d1.id = id;
  d2.id = id;
  d3.id = id;

  var p1: Promise<void> =
      expect(Rq.parseDraftStudentRequest(r1)).resolves.toStrictEqual(d1);
  var p2: Promise<void> = expect(Rq.parseDraftStudentRequest(r2))
                              .rejects.toBe(errors.cookArgumentError());
  var p3: Promise<void> = expect(Rq.parseDraftStudentRequest(r3))
                              .rejects.toBe(errors.cookArgumentError());
  var p4: Promise<void> = expect(Rq.parseDraftStudentRequest(r4))
                              .rejects.toBe(errors.cookArgumentError());

  return Promise.all([ p1, p2, p3, p4 ]);
});

test("Can parse mark as followed up request", () => {
  const key: string = "my-key-arrived-but";
  const id: string = "my-id-is-gone-:(";

  var ht: any = {sessionkey : key, type : "hold-tight"};
  var cf: any = {sessionkey : key, type : "confirmed"};
  var cd: any = {sessionkey : key, type : "cancelled"};
  var i1: any = {sessionkey : key, type : "invalid"};
  var i2: any = {type : "hold-tight"};
  var i3: any = {sessionkey : key};

  var okays = [ ht, cf, cd ].map(x => {
    var r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id;
    x.id = id;
    return expect(Rq.parseSetFollowupStudentRequest(r))
        .resolves.toStrictEqual(x);
  });

  var fails1 = [ i1, i2, i3 ].map(x => {
    var r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id;
    x.id = id;
    return expect(Rq.parseSetFollowupStudentRequest(r))
        .rejects.toBe(errors.cookArgumentError());
  });

  var fails2 = [ ht ].map(x => {
    var r: express.Request = getMockReq();
    r.body = {...x};
    return expect(Rq.parseSetFollowupStudentRequest(r))
        .rejects.toBe(errors.cookArgumentError());
  });

  return Promise.all([ okays, fails1, fails2 ].flat());
});

test("Can parse new template request", () => {
  const key: string = "yet-another-session-key";

  var ok1:
      any = {name : "my-template", content : "hello-there", sessionkey : key};
  var ok2: any = {
    name : "my-template",
    content : "hello-there",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?"
  };
  var ok3: any = {
    name : "my-template",
    content : "hello-there",
    sessionkey : key,
    cc : "cc@gmail.com"
  };
  var ok4: any = {
    name : "my-template",
    content : "hello-there",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };
  var ok5: any = {
    name : "my-template",
    content : "hello-there",
    subject : "I like C++",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };

  var f1: any = {
    content : "hello-there",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };
  var f2: any = {
    name : "my-template",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };
  var f3: any = {
    name : "my-template",
    content : "hello-there",
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };

  var okays = [ ok1, ok2, ok3, ok4, ok5 ].map(x => {
    var r: express.Request = getMockReq();
    r.body = {...x};
    ["desc", "cc", "subject"].forEach(v => {
      if (!(v in x))
        x[v] = undefined;
    });

    return expect(Rq.parseNewTemplateRequest(r)).resolves.toStrictEqual(x);
  });

  var fails1 = [ f1, f2, f3 ].map(x => {
    var r: express.Request = getMockReq();
    r.body = {...x};
    return expect(Rq.parseNewTemplateRequest(r))
        .rejects.toBe(errors.cookArgumentError());
  });

  return Promise.all([ okays, fails1 ].flat());
});

test("Can parse update template request", () => {
  const key: string = "yet-another-session-key";
  const id: string = "what-did-you-expect-this-is-an-id";

  var ok1:
      any = {name : "my-template", content : "hello-there", sessionkey : key};
  var ok2: any = {
    name : "my-template",
    content : "hello-there",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?"
  };
  var ok3: any = {
    name : "my-template",
    content : "hello-there",
    sessionkey : key,
    cc : "cc@gmail.com"
  };
  var ok4: any = {
    name : "my-template",
    content : "hello-there",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };
  var ok5: any = {
    content : "hello-there",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };
  var ok6: any = {
    name : "my-template",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };
  var ok7: any = {
    name : "my-template",
    content : "hello-there",
    subject : "I like C++",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };

  var f1: any = {sessionkey : key};
  var f2: any = {name : "my-template", content : "hello-there"};

  var okays = [ ok1, ok2, ok3, ok4, ok5, ok6, ok7 ].map(x => {
    var r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id;
    x.id = id;
    ["name", "content", "subject", "desc", "cc"].forEach(v => {
      if (!(v in x))
        x[v] = undefined;
    });

    return expect(Rq.parseUpdateTemplateRequest(r)).resolves.toStrictEqual(x);
  });

  var fails1 = [ f1, f2 ].map(x => {
    var r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id;
    return expect(Rq.parseUpdateTemplateRequest(r))
        .rejects.toBe(errors.cookArgumentError());
  });

  var fails2 = [ ok1 ].map(x => {
    var r: express.Request = getMockReq();
    r.body = {...x};
    return expect(Rq.parseUpdateTemplateRequest(r))
        .rejects.toBe(errors.cookArgumentError());
  });

  return Promise.all([ okays, fails1, fails2 ].flat());
});
