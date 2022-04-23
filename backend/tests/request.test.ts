import { getMockReq } from "@jest-mock/express";
import express from "express";

import * as config from "../config.json";
import * as Rq from "../request";
import * as T from "../types";
import { errors } from "../utility";

function setSessionKey(req: express.Request, key: string): void {
    req.headers.authorization = config.global.authScheme + " " + key;
}

test("Can parse Key-only requests", () => {
    const valid: express.Request = getMockReq();
    const invalid: express.Request = getMockReq();
    const wrongprop: express.Request = getMockReq();

    // valid.body.sessionkey = "hello I am a key";
    // valid.headers.authorization = config.global.authScheme + " hello I am a
    // key";
    setSessionKey(valid, "hello I am a key");
    wrongprop.body.key = "hello I am a key as well";

    const calls = [
        Rq.parseLogoutRequest,
        Rq.parseStudentAllRequest,
        Rq.parseCoachAllRequest,
        Rq.parseGetAllCoachRequestsRequest,
        Rq.parseAdminAllRequest,
        Rq.parseProjectAllRequest,
        Rq.parseConflictAllRequest,
        Rq.parseFollowupAllRequest,
        Rq.parseTemplateListRequest,
        Rq.parseProjectConflictsRequest,
    ];

    const successes = calls.map((call) =>
        expect(call(valid)).resolves.toStrictEqual({
            sessionkey: "hello I am a key",
        })
    );

    const failures = calls
        .flatMap((call) => [call(invalid), call(wrongprop)])
        .map((sub) =>
            expect(sub).rejects.toStrictEqual(errors.cookUnauthenticated())
        );

    return Promise.all([successes, failures].flat());
});

test("Can parse Key-ID requests", () => {
    const res: T.Requests.IdRequest = {
        sessionkey: "Hello I am a key",
        id: 20123,
    };
    const valid: express.Request = getMockReq();
    const neither: express.Request = getMockReq();
    const onlyKey: express.Request = getMockReq();
    const onlyid: express.Request = getMockReq();

    // valid.body.sessionkey = res.sessionkey;
    setSessionKey(valid, res.sessionkey);
    valid.params.id = res.id.toString();
    // onlyKey.body.sessionkey = res.sessionkey;
    setSessionKey(onlyKey, res.sessionkey);
    onlyid.params.id = res.id.toString();

    const calls = [
        Rq.parseSingleStudentRequest,
        Rq.parseDeleteStudentRequest,
        Rq.parseSingleCoachRequest,
        Rq.parseDeleteCoachRequest,
        Rq.parseGetCoachRequestRequest,
        Rq.parseDenyNewCoachRequest,
        Rq.parseSingleAdminRequest,
        Rq.parseDeleteAdminRequest,
        Rq.parseSingleProjectRequest,
        Rq.parseDeleteProjectRequest,
        Rq.parseGetDraftedStudentsRequest,
        Rq.parseGetFollowupStudentRequest,
        Rq.parseGetTemplateRequest,
        Rq.parseDeleteTemplateRequest,
    ];

    const successes = calls.map((call) =>
        expect(call(valid)).resolves.toStrictEqual(res)
    );

    const failures = calls
        .flatMap((call) => [call(neither), call(onlyid)])
        .map((sub) =>
            expect(sub).rejects.toStrictEqual(errors.cookUnauthenticated())
        );

    const otherfails = calls
        .map((call) => call(onlyKey))
        .map((sub) =>
            expect(sub).rejects.toStrictEqual(errors.cookArgumentError())
        );

    return Promise.all([successes, failures, otherfails].flat());
});

test("Can parse update login user requests", () => {
    const id = 1234;
    const key = "abc";
    const valid1: T.Anything = {
        isAdmin: false,
        isCoach: false,
        accountStatus: "PENDING",
    };

    const invalid1: T.Anything = { isCoach: false, accountStatus: "PENDING" };
    const invalid2: T.Anything = {
        isCoach: false,
        accountStatus: "PENDING",
    };
    const invalid_sk: T.Anything = {
        isAdmin: false,
        isCoach: false,
        accountStatus: "PENDING",
    };

    const s = [valid1].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        r.params.id = id.toString();
        setSessionKey(r, key);
        x.id = id;
        x.sessionkey = key;
        return expect(Rq.parseUpdateCoachRequest(r)).resolves.toStrictEqual(x);
    });

    const f = [invalid1, invalid2].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        r.params.id = id.toString();
        setSessionKey(r, key);
        x.id = id;
        x.sessionkey = key;
        return expect(Rq.parseUpdateCoachRequest(r)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    const s_ = [valid1].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        setSessionKey(r, key);
        r.params.id = id.toString();
        x.id = id;
        x.sessionkey = key;
        return expect(Rq.parseUpdateAdminRequest(r)).resolves.toStrictEqual(x);
    });

    const f_ = [invalid1, invalid2].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        setSessionKey(r, key);
        return expect(Rq.parseUpdateAdminRequest(r)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    const f__ = [Rq.parseUpdateAdminRequest, Rq.parseUpdateCoachRequest].map(
        (f) => {
            const r: express.Request = getMockReq();
            r.body = { ...invalid_sk };
            r.params.id = id.toString();
            return expect(f(r)).rejects.toBe(errors.cookUnauthenticated());
        }
    );

    return Promise.all([s, f, s_, f_, f__].flat());
});

test("Can parse login request", () => {
    const valid: express.Request = getMockReq();
    const noname: express.Request = getMockReq();
    const nopass: express.Request = getMockReq();

    valid.body.name = "Alice.STUDENT@hotmail.be";
    valid.body.pass = "Pass #1";
    noname.body.pass = "Pass #2";
    nopass.body.name = "Name.2@email.be";

    // TODO
    return Promise.all([
        expect(Rq.parseLoginRequest(valid)).resolves.toStrictEqual({
            name: "alice.student@hotmail.be",
            pass: "Pass #1",
        }),
        expect(Rq.parseLoginRequest(noname)).rejects.toBe(
            errors.cookArgumentError()
        ),
        expect(Rq.parseLoginRequest(nopass)).rejects.toBe(
            errors.cookArgumentError()
        ),
    ]);
});

test("Can parse update student request", () => {
    const sessionkey = "abcdef";
    const dataV: T.Anything = {
        emailOrGithub: "ab@c.de",
        alumni: false,
        firstName: "ab c",
        lastName: "",
        gender: "Apache Attack Helicopter",
        pronouns: "vroom/vroom",
        phone: "+32420 696969",
        nickname: "jefke",
        education: {
            level: 7,
            duration: 9,
            year: "something?!?!?",
            institute: "KULeuven",
        },
    };

    const failure1: T.Anything = {
        emailOrGithub: "ab@c.de",
        firstName: "ab", // no last name
        gender: "Apache Attack Helicopter",
        pronouns: "vroom/vroom",
        phone: "+32420 696969",
        education: {
            level: 7,
            duration: 9,
            year: "something?!?!?",
            institute: "KULeuven",
        },
    };

    const failure2: T.Anything = {
        emailOrGithub: "ab@c.de",
        firstName: "ab c",
        lastName: "",
        gender: "Apache Attack Helicopter",
        pronouns: "vroom/vroom",
        phone: "+32420 696969",
        education: {
            level: 7, // missing duration
            year: "something?!?!?",
            institute: "KULeuven",
        },
    };

    const failure3: T.Anything = {};

    const id = 60011223369;

    const valid: express.Request = getMockReq();
    const ival1: express.Request = getMockReq();
    const ival2: express.Request = getMockReq();
    const ival3: express.Request = getMockReq();

    valid.body = { ...dataV };
    valid.params.id = id.toString();
    setSessionKey(valid, sessionkey);
    ival1.body = { ...failure1 };
    ival1.params.id = id.toString();
    setSessionKey(ival1, sessionkey);
    ival2.body = { ...failure2 };
    ival2.params.id = id.toString();
    setSessionKey(ival2, sessionkey);
    ival3.body = { ...failure3 };
    ival3.params.id = id.toString();
    setSessionKey(ival3, sessionkey);

    dataV.id = id;
    dataV.sessionkey = sessionkey;
    failure1.id = id;
    failure1.lastName = undefined;
    failure1.alumni = undefined;
    failure1.nickname = undefined;
    failure1.sessionkey = sessionkey;
    failure2.id = id;
    (failure2.education as T.Anything).duration = undefined;
    failure2.alumni = undefined;
    failure2.nickname = undefined;
    failure2.sessionkey = sessionkey;

    const error = errors.cookArgumentError();

    return Promise.all([
        expect(Rq.parseUpdateStudentRequest(valid)).resolves.toStrictEqual(
            dataV
        ),
        expect(Rq.parseUpdateStudentRequest(ival1)).resolves.toStrictEqual(
            failure1
        ),
        expect(Rq.parseUpdateStudentRequest(ival2)).resolves.toStrictEqual(
            failure2
        ),
        expect(Rq.parseUpdateStudentRequest(ival3)).rejects.toStrictEqual(
            error
        ),
    ]);
});

test("Can parse suggest student request", () => {
    const key = "my-session-key";
    const id = 9845;
    const ys: T.Anything = { suggestion: "YES", senderId: 0 };
    const mb: T.Anything = { suggestion: "MAYBE", senderId: 0 };
    const no: T.Anything = { suggestion: "NO", senderId: 0 };
    const nr: T.Anything = {
        suggestion: "NO",
        reason: "I just don't like you",
        senderId: 0,
    };
    const i1: T.Anything = { suggestion: "TOMORROW", senderId: 0 };
    const i2: T.Anything = { suggestion: "no", senderId: 0 }; // no caps
    const i3: T.Anything = { senderId: 0 };

    const okays = [ys, mb, no, nr].map((x) => {
        const copy: T.Anything = { ...x };
        copy.id = id;
        const req: express.Request = getMockReq();
        req.params.id = id.toString();
        req.body = x;
        setSessionKey(req, key);
        ["reason"].forEach((x) => {
            if (!(x in req.body)) {
                copy[x] = undefined;
            }
        });
        copy.sessionkey = key;
        return expect(
            Rq.parseSuggestStudentRequest(req)
        ).resolves.toStrictEqual(copy);
    });

    const fails = [i1, i2, i3].map((x) => {
        const req: express.Request = getMockReq();
        req.params.id = id.toString();
        req.body = { ...x };
        setSessionKey(req, key);
        return expect(Rq.parseSuggestStudentRequest(req)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    return Promise.all([okays, fails].flat());
});

// TODO test Rq.parseAcceptNewUserRequest
// TODO test Rq.parseGetSuggestionsStudentRequest

test("Can parse final decision request", () => {
    const key = "key";
    const id = 6969420420;
    const data: T.Anything = {};
    const dat2: T.Anything = { reply: "YES" };
    const dat3: T.Anything = { reply: "NO" };
    const dat4: T.Anything = { reply: "MAYBE" };
    const dat5: T.Anything = { reply: "something" };
    const dat6: T.Anything = { reply: "maybe" };
    const dat7: T.Anything = { reply: "YES" };

    const p = [data, dat2, dat3, dat4].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        r.params.id = id.toString();
        setSessionKey(r, key);
        x.id = id;
        x.sessionkey = key;
        if (!("reply" in x)) x.reply = undefined;
        if (!("reason" in x)) x.reason = undefined;

        return expect(
            Rq.parseFinalizeDecisionRequest(r)
        ).resolves.toStrictEqual(x);
    });

    const q = [dat5, dat6].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        r.params.id = id.toString();
        setSessionKey(r, key);
        x.id = id;
        return expect(Rq.parseFinalizeDecisionRequest(r)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    const r = [dat7].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        r.params.id = id.toString();
        x.id = id;
        return expect(Rq.parseFinalizeDecisionRequest(r)).rejects.toBe(
            errors.cookUnauthenticated()
        );
    });

    return Promise.all([p, q, r].flat());
});

test("Can parse coach access request", () => {
    const r1: T.Anything = {
        firstName: "Jeff Georgette",
        lastName: "",
        email: "idonthavegithub@git.hub",
        pass: "thisismypassword",
    };

    const r2: T.Anything = {
        firstName: "Jeff Georgette",
        lastName: "",
        email: "idonthavegithub@git.hub",
    };

    const req1: express.Request = getMockReq();
    req1.body = { ...r1 };

    const req2: express.Request = getMockReq();
    r2.pass = undefined;
    req2.body = { ...r2 };

    const req3: express.Request = getMockReq();
    req3.body = {};

    console.log(Rq.parseRequestUserRequest(req1));
    console.log(r1);

    const prom1: Promise<void> = expect(
        Rq.parseRequestUserRequest(req1)
    ).resolves.toStrictEqual(r1);
    const prom2: Promise<void> = expect(
        Rq.parseRequestUserRequest(req2)
    ).resolves.toStrictEqual(r2);
    const prom3: Promise<void> = expect(
        Rq.parseRequestUserRequest(req3)
    ).rejects.toBe(errors.cookArgumentError());

    return Promise.all([prom1, prom2, prom3]);
});

test("Can parse new project request", () => {
    const key = "abcdefghijklmnopqrstuvwxyz";
    const d1: T.Anything = {
        name: "Experiment One",
        partner: "Simic Combine",
        start: Date.now(),
        end: Date.now(),
        positions: 69,
        osocId: 17,
    };
    const d2: T.Anything = {};
    const d3: T.Anything = {
        name: "Experiment One",
        partner: "Simic Combine",
        start: Date.now(),
        end: Date.now(),
        positions: 420,
    };

    const req1: express.Request = getMockReq();
    const req2: express.Request = getMockReq();
    const req3: express.Request = getMockReq();

    req1.body = { ...d1 };
    setSessionKey(req1, key);
    req2.body = { ...d2 };
    setSessionKey(req2, key);
    req3.body = { ...d3 };

    d1.sessionkey = key;

    const p1: Promise<void> = expect(
        Rq.parseNewProjectRequest(req1)
    ).resolves.toStrictEqual(d1);
    const p2: Promise<void> = expect(
        Rq.parseNewProjectRequest(req2)
    ).rejects.toBe(errors.cookArgumentError());
    const p3: Promise<void> = expect(
        Rq.parseNewProjectRequest(req3)
    ).rejects.toBe(errors.cookUnauthenticated());

    return Promise.all([p1, p2, p3]);
});

test("Can parse update project request", () => {
    const key = "abcdefghijklmnopqrstuvwxyz";
    const id = 6845684;
    const d1: T.Anything = {
        name: "Experiment One",
        partner: "Simic Combine",
        start: Date.now(),
        end: Date.now(),
        positions: 69,
    };
    const d2: T.Anything = {};
    const d3: T.Anything = {
        name: "Experiment One",
        partner: "Simic Combine",
        start: Date.now(),
        positions: 420,
    };
    const d4: T.Anything = {
        name: "Experiment One",
        partner: "Simic Combine",
        start: Date.now(),
        end: Date.now(),
        positions: 69,
    };

    const req1: express.Request = getMockReq();
    const req2: express.Request = getMockReq();
    const req3: express.Request = getMockReq();
    const req4: express.Request = getMockReq();
    const req5: express.Request = getMockReq();

    req1.body = { ...d1 };
    req1.params.id = id.toString();
    setSessionKey(req1, key);
    req2.body = { ...d2 };
    req2.params.id = id.toString();
    setSessionKey(req2, key);
    req3.body = { ...d3 };
    req3.params.id = id.toString();
    setSessionKey(req3, key);
    req4.body = { ...d4 };
    req4.params.id = id.toString();
    req5.body = { ...d1 };
    setSessionKey(req5, key);

    d1.id = id;
    d1.sessionkey = key;
    d2.id = id;
    d3.id = id;
    d3.sessionkey = key;
    d3.end = undefined;
    d4.id = id;

    const p1: Promise<void> = expect(
        Rq.parseUpdateProjectRequest(req1)
    ).resolves.toStrictEqual(d1);
    const p2: Promise<void> = expect(
        Rq.parseUpdateProjectRequest(req2)
    ).rejects.toBe(errors.cookArgumentError());
    const p3: Promise<void> = expect(
        Rq.parseUpdateProjectRequest(req3)
    ).resolves.toStrictEqual(d3);
    const p4: Promise<void> = expect(
        Rq.parseUpdateProjectRequest(req4)
    ).rejects.toBe(errors.cookUnauthenticated());
    const p5: Promise<void> = expect(
        Rq.parseUpdateProjectRequest(req5)
    ).rejects.toBe(errors.cookArgumentError());

    return Promise.all([p1, p2, p3, p4, p5]);
});

test("Can parse draft student request", () => {
    const key = "keyyyyy";
    const id = 89846;

    const d1: T.Anything = {
        studentId: "im-a-student",
        role: "the useless one",
    };
    const d2: T.Anything = { studentId: "im-a-student" };
    const d3: T.Anything = { studentId: "im-a-student", role: "the lazy one" };

    const r1: express.Request = getMockReq();
    const r2: express.Request = getMockReq();
    const r3: express.Request = getMockReq();
    const r4: express.Request = getMockReq();

    r1.body = { ...d1 };
    setSessionKey(r1, key);
    r2.body = { ...d2 };
    setSessionKey(r2, key);
    r3.body = { ...d3 };
    r4.body = { ...d1 };
    setSessionKey(r4, key);

    r1.params.id = id.toString();
    r2.params.id = id.toString();
    r3.params.id = id.toString();

    d1.id = id;
    d1.sessionkey = key;
    d2.id = id;
    d3.id = id;

    const p1: Promise<void> = expect(
        Rq.parseDraftStudentRequest(r1)
    ).resolves.toStrictEqual(d1);
    const p2: Promise<void> = expect(
        Rq.parseDraftStudentRequest(r2)
    ).rejects.toBe(errors.cookArgumentError());
    const p3: Promise<void> = expect(
        Rq.parseDraftStudentRequest(r3)
    ).rejects.toBe(errors.cookUnauthenticated());
    const p4: Promise<void> = expect(
        Rq.parseDraftStudentRequest(r4)
    ).rejects.toBe(errors.cookArgumentError());

    return Promise.all([p1, p2, p3, p4]);
});

test("Can parse mark as followed up request", () => {
    const key = "my-key-arrived-but";
    const id = 78945312;

    const sc: T.Anything = { type: "SCHEDULED" };
    const st: T.Anything = { type: "SENT" };
    const fl: T.Anything = { type: "FAILED" };
    const no: T.Anything = { type: "NONE" };
    const dr: T.Anything = { type: "DRAFT" };
    const i1: T.Anything = { type: "invalid" };
    const i3: T.Anything = {};

    const okays = [sc, st, fl, no, dr].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        setSessionKey(r, key);
        r.params.id = id.toString();
        x.id = id;
        x.sessionkey = key;
        return expect(
            Rq.parseSetFollowupStudentRequest(r)
        ).resolves.toStrictEqual(x);
    });

    const fails1 = [i1, i3].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        setSessionKey(r, key);
        r.params.id = id.toString();
        x.id = id;
        return expect(Rq.parseSetFollowupStudentRequest(r)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    const fails2 = [fl].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        setSessionKey(r, key);
        return expect(Rq.parseSetFollowupStudentRequest(r)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    const fails3 = [no].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        r.params.id = id.toString();
        x.id = id;
        return expect(Rq.parseSetFollowupStudentRequest(r)).rejects.toBe(
            errors.cookUnauthenticated()
        );
    });

    return Promise.all([okays, fails1, fails2, fails3].flat());
});

test("Can parse new template request", () => {
    const key = "yet-another-session-key";

    const ok1: T.Anything = { name: "my-template", content: "hello-there" };
    const ok2: T.Anything = { name: "my-template", content: "hello-there" };
    const ok3: T.Anything = {
        name: "my-template",
        content: "hello-there",
        cc: "cc@gmail.com",
    };
    const ok4: T.Anything = {
        name: "my-template",
        content: "hello-there",
        cc: "cc@gmail.com",
    };
    const ok5: T.Anything = {
        name: "my-template",
        content: "hello-there",
        subject: "I like C++",
        cc: "cc@gmail.com",
    };

    const f1: T.Anything = { content: "hello-there", cc: "cc@gmail.com" };
    const f2: T.Anything = { name: "my-template", cc: "cc@gmail.com" };
    const f3: T.Anything = {
        name: "my-template",
        content: "hello-there",
        cc: "cc@gmail.com",
    };

    const okays = [ok1, ok2, ok3, ok4, ok5].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        setSessionKey(r, key);
        ["cc", "subject"].forEach((v) => {
            if (!(v in x)) x[v] = undefined;
        });
        x.sessionkey = key;

        return expect(Rq.parseNewTemplateRequest(r)).resolves.toStrictEqual(x);
    });

    const fails1 = [f1, f2].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        setSessionKey(r, key);
        return expect(Rq.parseNewTemplateRequest(r)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    const fails2 = [f3].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        return expect(Rq.parseNewTemplateRequest(r)).rejects.toBe(
            errors.cookUnauthenticated()
        );
    });

    return Promise.all([okays, fails1, fails2].flat());
});

test("Can parse update template request", () => {
    const key = "yet-another-session-key";
    const id = 987465327465;

    const ok1: T.Anything = { name: "my-template", content: "hello-there" };
    const ok2: T.Anything = {
        name: "my-template",
        content: "hello-there",
        desc: "a description did you know that orcas have culture?",
    };
    const ok3: T.Anything = {
        name: "my-template",
        content: "hello-there",
        cc: "cc@gmail.com",
    };
    const ok4: T.Anything = {
        name: "my-template",
        content: "hello-there",
        desc: "a description did you know that orcas have culture?",
        cc: "cc@gmail.com",
    };
    const ok5: T.Anything = {
        content: "hello-there",
        desc: "a description did you know that orcas have culture?",
        cc: "cc@gmail.com",
    };
    const ok6: T.Anything = {
        name: "my-template",
        desc: "a description did you know that orcas have culture?",
        cc: "cc@gmail.com",
    };
    const ok7: T.Anything = {
        name: "my-template",
        content: "hello-there",
        subject: "I like C++",
        desc: "a description did you know that orcas have culture?",
        cc: "cc@gmail.com",
    };

    const f1: T.Anything = {};
    const f2: T.Anything = { name: "my-template", content: "hello-there" };

    const okays = [ok1, ok2, ok3, ok4, ok5, ok6, ok7].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        r.params.id = id.toString();
        setSessionKey(r, key);
        x.id = id;
        x.sessionkey = key;
        ["name", "content", "subject", "desc", "cc"].forEach((v) => {
            if (!(v in x)) x[v] = undefined;
        });

        return expect(Rq.parseUpdateTemplateRequest(r)).resolves.toStrictEqual(
            x
        );
    });

    const fails1 = [f1].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        r.params.id = id.toString();
        setSessionKey(r, key);
        return expect(Rq.parseUpdateTemplateRequest(r)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    const fails2 = [ok1].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        setSessionKey(r, key);
        return expect(Rq.parseUpdateTemplateRequest(r)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    const fails3 = [f2].map((x) => {
        const r: express.Request = getMockReq();
        r.body = { ...x };
        r.params.id = id.toString();
        return expect(Rq.parseUpdateTemplateRequest(r)).rejects.toBe(
            errors.cookUnauthenticated()
        );
    });

    return Promise.all([okays, fails1, fails2, fails3].flat());
});

test("Can parse self-modify requests", () => {
    const key = "Im bobs secret key, dont tell anyone";
    const v1: T.Anything = {};
    const v2: T.Anything = { name: "BOBv2" };
    const v3: T.Anything = { pass: { oldpass: "PASSv1", newpass: "PASSv2" } };

    const i1: T.Anything = { name: "BOBv2", pass: "Nothing" };
    const i2: T.Anything = { name: "BOBv2", pass: { oldpass: "PASSv1" } };
    const i3: T.Anything = { name: "BOBv2", pass: { newpass: "PASSv2" } };

    const valids = [v1, v2, v3].map((r) => {
        const req: express.Request = getMockReq();
        req.body = { ...r };
        setSessionKey(req, key);
        r.sessionkey = key;
        ["name", "pass"].forEach((x) => {
            if (!(x in r)) r[x] = undefined;
        });

        expect(Rq.parseUserModSelfRequest(req)).resolves.toStrictEqual(r);
    });

    const invalids = [i1, i2, i3].map((r) => {
        const req: express.Request = getMockReq();
        req.body = { ...r };
        setSessionKey(req, key);

        expect(Rq.parseUserModSelfRequest(req)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    const unauths = [v1, v2, v3].map((r) => {
        const req: express.Request = getMockReq();
        req.body = { ...r };

        expect(Rq.parseUserModSelfRequest(req)).rejects.toBe(
            errors.cookUnauthenticated()
        );
    });

    return Promise.all([valids, invalids, unauths].flat());
});
