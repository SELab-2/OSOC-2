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
        Rq.parseCoachAllRequest,
        Rq.parseGetAllCoachRequestsRequest,
        Rq.parseAdminAllRequest,
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

test("Can parse pagination requests", () => {
    const valid: express.Request = getMockReq();
    const invalid: express.Request = getMockReq();
    const wrongprop: express.Request = getMockReq();
    const validPg: express.Request = getMockReq();

    setSessionKey(valid, "hello I am a key");
    setSessionKey(validPg, "hello I am a key");
    wrongprop.body.key = "hello I am a key as well";
    validPg.body.currentPage = 5;
    const size = config.global.pageSize;

    const calls = [
        Rq.parseStudentAllRequest,
        Rq.parseProjectAllRequest,
        Rq.parseUserAllRequest,
    ];

    const successes = calls.map((call) =>
        expect(call(valid)).resolves.toStrictEqual({
            sessionkey: "hello I am a key",
            currentPage: 0,
            pageSize: size,
        })
    );

    const paged = calls.map((call) =>
        expect(call(validPg)).resolves.toStrictEqual({
            sessionkey: "hello I am a key",
            currentPage: 5,
            pageSize: size,
        })
    );

    const failures = calls
        .flatMap((call) => [call(invalid), call(wrongprop)])
        .map((sub) =>
            expect(sub).rejects.toStrictEqual(errors.cookUnauthenticated())
        );

    return Promise.all([successes, paged, failures].flat());
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

    return Promise.all([s, s_, f_, f__].flat());
});

test("Can parse login request", () => {
    const valid: express.Request = getMockReq();
    const noname: express.Request = getMockReq();
    const nopass: express.Request = getMockReq();
    const unvalid: express.Request = getMockReq();

    valid.body.name = "Alice.STUDENT@hotmail.be";
    valid.body.pass = "Pass #1";
    noname.body.pass = "Pass #2";
    nopass.body.name = "Name.2@email.be";
    unvalid.body.pass = "Pass #2";
    unvalid.body.name = "Name.email.be";

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
        expect(Rq.parseLoginRequest(unvalid)).rejects.toBe(
            errors.cookArgumentError()
        ),
    ]);
});

test("Can parse update student request", () => {
    const sessionkey = "abcdef";
    const dataV: T.Anything = {
        emailOrGithub: "ab@c.de",
        alumni: false,
        name: "ab c",
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
        name: "ab",
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
        name: "ab c",
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
    const ys: T.Anything = { suggestion: "YES" };
    const mb: T.Anything = { suggestion: "MAYBE" };
    const no: T.Anything = { suggestion: "NO" };
    const nr: T.Anything = {
        suggestion: "NO",
        reason: "I just don't like you",
    };
    const i1: T.Anything = { suggestion: "TOMORROW" };
    const i2: T.Anything = { suggestion: "no" }; // no caps

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

    const fails = [i1, i2].map((x) => {
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

test("Can parse get suggestions request", () => {
    const key = "my-session-key";
    const id = 9845;

    const noYear: T.Anything = {};
    const year: T.Anything = { year: 2022 };

    const i1: T.Anything = { year: 2022 };

    const okays = [noYear, year].map((x) => {
        const copy: T.Anything = { ...x };
        copy.id = id;
        const req: express.Request = getMockReq();
        req.params.id = id.toString();
        req.body = x;
        setSessionKey(req, key);
        copy.sessionkey = key;
        return expect(
            Rq.parseGetSuggestionsStudentRequest(req)
        ).resolves.toStrictEqual(copy);
    });

    const fails = [i1].map((x) => {
        const req: express.Request = getMockReq();
        req.body = { ...x };
        setSessionKey(req, key);
        return expect(Rq.parseSuggestStudentRequest(req)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    return Promise.all([okays, fails].flat());
});

test("Can parse get student request", () => {
    const key = "my-session-key";
    const id = 9845;

    const noYear: T.Anything = {};
    const year: T.Anything = { year: 2022 };

    const i1: T.Anything = { year: 2022 };

    const okays = [noYear, year].map((x) => {
        const copy: T.Anything = { ...x };
        copy.id = id;
        const req: express.Request = getMockReq();
        req.params.id = id.toString();
        req.body = x;
        setSessionKey(req, key);
        copy.sessionkey = key;
        return expect(Rq.parseSingleStudentRequest(req)).resolves.toStrictEqual(
            copy
        );
    });

    const fails = [i1].map((x) => {
        const req: express.Request = getMockReq();
        req.body = { ...x };
        setSessionKey(req, key);
        return expect(Rq.parseSingleStudentRequest(req)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    return Promise.all([okays, fails].flat());
});

test("Can parse filter osocs request", () => {
    const key = "my-session-key";

    const nothing = {};
    const yearFilterOnly = { yearFilter: 2022 };
    const yearSortOnly1 = { yearSort: "asc" };
    const yearSortOnly2 = { yearSort: "desc" };
    const yearFilterAndSort = { yearFilter: 2022, yearSort: "asc" };

    const i1: T.Anything = { yearSort: "sort" };
    const i2: T.Anything = { yearFilter: 2022, yearSort: "sort" };

    const okays = [
        nothing,
        yearFilterOnly,
        yearSortOnly1,
        yearSortOnly2,
        yearFilterAndSort,
    ].map((x) => {
        const copy: T.Anything = { ...x };
        const req: express.Request = getMockReq();
        req.body = x;
        setSessionKey(req, key);
        ["yearFilter", "yearSort"].forEach((x) => {
            if (!(x in req.body)) {
                copy[x] = undefined;
            }
        });
        copy.sessionkey = key;
        return expect(Rq.parseFilterOsocsRequest(req)).resolves.toStrictEqual({
            ...copy,
            currentPage: 0,
            pageSize: config.global.pageSize,
        });
    });

    const fails = [i1, i2].map((x) => {
        const req: express.Request = getMockReq();
        req.body = { ...x };
        setSessionKey(req, key);
        return expect(Rq.parseFilterOsocsRequest(req)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    const unauth = [
        nothing,
        yearFilterOnly,
        yearSortOnly1,
        yearSortOnly2,
        yearFilterAndSort,
    ].map((body) => {
        const req: express.Request = getMockReq();
        req.body = { ...body };
        expect(Rq.parseFilterOsocsRequest(req)).rejects.toBe(
            errors.cookUnauthenticated()
        );
    });

    return Promise.all([okays, fails, unauth].flat());
});

test("Can parse filter students request", () => {
    const key = "my-session-key";

    const nothing = {};
    const osocYear: T.Requests.StudentFilterParameters = { osocYear: 2022 };
    const nameFilter: T.Requests.StudentFilterParameters = {
        nameFilter: "Firstname",
    };
    const emailFilterGoodEmail: T.Requests.StudentFilterParameters = {
        emailFilter: "firstname.lastname@hotmail.com",
    };
    const emailFilterBadEmail: T.Requests.StudentFilterParameters = {
        emailFilter: "email",
    };
    const roleFilterList: T.Requests.StudentFilterParameters = {
        roleFilter: ["Frontend developer", "Backend developer"],
    };
    const roleFilterString: T.Requests.StudentFilterParameters = {
        roleFilter: "Frontend developer,Backend developer",
    };
    const alumniFilterBoolean: T.Requests.StudentFilterParameters = {
        alumniFilter: true,
    };
    const alumniFilterString: T.Requests.StudentFilterParameters = {
        alumniFilter: "true",
    };
    const coachFilterBoolean: T.Requests.StudentFilterParameters = {
        coachFilter: true,
    };
    const coachFilterString: T.Requests.StudentFilterParameters = {
        coachFilter: "true",
    };
    const statusFilter: T.Requests.StudentFilterParameters = {
        statusFilter: "YES",
    };
    const emailStatusFilter: T.Requests.StudentFilterParameters = {
        emailStatusFilter: "SENT",
    };
    const nameSort: T.Requests.StudentFilterParameters = {
        nameSort: "asc",
    };
    const emailSort: T.Requests.StudentFilterParameters = { emailSort: "desc" };

    const wrongStatus: T.Anything = { statusFilter: "damn" };
    const wrongEmailStatus: T.Anything = { emailStatusFilter: "email status" };
    const wrongNameSort: T.Anything = { nameSort: "firstname" };
    const wrongEmailSort: T.Anything = { emailSort: "email" };
    const wrongAlumniFilter: T.Anything = { alumniFilter: "is_admin filter" };
    const wrongCoachFilter: T.Anything = { coachFilter: "is_coach filter" };

    const okays = [
        [nothing, nothing],
        [osocYear, osocYear],
        [nameFilter, nameFilter],
        [emailFilterGoodEmail, emailFilterGoodEmail],
        [emailFilterBadEmail, emailFilterBadEmail],
        [roleFilterList, roleFilterList],
        [alumniFilterBoolean, alumniFilterBoolean],
        [coachFilterBoolean, coachFilterBoolean],
        [statusFilter, statusFilter],
        [emailStatusFilter, emailStatusFilter],
        [nameSort, nameSort],
        [emailSort, emailSort],
        [roleFilterString, roleFilterList],
        [alumniFilterString, alumniFilterBoolean],
        [coachFilterString, coachFilterBoolean],
    ].map((x) => {
        const copy: T.Anything = { ...x[1] };
        const req: express.Request = getMockReq();
        req.body = x[0];
        setSessionKey(req, key);
        [
            "nameFilter",
            "emailFilter",
            "alumniFilter",
            "coachFilter",
            "statusFilter",
            "emailStatusFilter",
            "nameSort",
            "roleFilter",
            "emailSort",
        ].forEach((v) => {
            if (!(v in req.body)) {
                copy[v] = undefined;
            }
        });

        copy.currentPage = 0;
        copy.pageSize = config.global.pageSize;

        if (!("osocYear" in req.body)) {
            copy["osocYear"] = new Date().getFullYear();
        }
        copy.sessionkey = key;
        return expect(
            Rq.parseFilterStudentsRequest(req)
        ).resolves.toStrictEqual(copy);
    });

    const fails = [
        wrongStatus,
        wrongNameSort,
        wrongEmailSort,
        wrongEmailStatus,
        wrongAlumniFilter,
        wrongCoachFilter,
    ].map((x) => {
        const req: express.Request = getMockReq();
        req.body = { ...x };
        setSessionKey(req, key);
        return expect(Rq.parseFilterStudentsRequest(req)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    const unauth = [
        nothing,
        osocYear,
        nameFilter,
        emailFilterGoodEmail,
        emailFilterBadEmail,
        roleFilterList,
        alumniFilterBoolean,
        coachFilterBoolean,
        statusFilter,
        emailStatusFilter,
        nameSort,
        emailSort,
        roleFilterString,
        alumniFilterString,
        coachFilterString,
    ].map((body) => {
        const req: express.Request = getMockReq();
        req.body = { ...body };
        return expect(Rq.parseFilterStudentsRequest(req)).rejects.toBe(
            errors.cookUnauthenticated()
        );
    });

    return Promise.all([okays, fails, unauth].flat());
});

test("Can parse filter users request", () => {
    const key = "my-session-key";

    const nothing = {};
    const emailFilterGoodEmail = {
        emailFilter: "firstname.lastname@hotmail.com",
    };
    const emailFilterBadEmail = {
        emailFilter: "email",
    };
    const isAdminFilterBoolean = {
        isAdminFilter: true,
    };
    const isAdminFilterString = {
        isAdminFilter: "true",
    };
    const isCoachFilterBoolean = {
        isCoachFilter: true,
    };
    const isCoachFilterString = {
        isCoachFilter: "true",
    };
    const statusFilter = {
        statusFilter: "ACTIVATED",
    };
    const nameFilter = {
        nameFilter: "Name",
    };
    const nameSort = {
        nameSort: "asc",
    };
    const emailSort = {
        emailSort: "asc",
    };

    const wrongStatus: T.Anything = { statusFilter: "status" };
    const wrongIsAdmin: T.Anything = { isAdminFilter: "is_admin filter" };
    const wrongIsCoach: T.Anything = { isCoachFilter: "is_coach filter" };
    const wrongNameSort: T.Anything = { nameSort: "lastname" };
    const wrongEmailSort: T.Anything = { emailSort: "email" };

    const okays = [
        [nothing, nothing],
        [isAdminFilterString, isAdminFilterBoolean],
        [isCoachFilterString, isCoachFilterBoolean],
        [nameFilter, nameFilter],
        [emailFilterGoodEmail, emailFilterGoodEmail],
        [emailFilterBadEmail, emailFilterBadEmail],
        [nameSort, nameSort],
        [statusFilter, statusFilter],
        [emailSort, emailSort],
    ].map((x) => {
        const copy: T.Anything = { ...x[1] };
        const req: express.Request = getMockReq();
        req.body = x[0];
        setSessionKey(req, key);
        [
            "isAdminFilter",
            "isCoachFilter",
            "nameFilter",
            "emailFilter",
            "nameSort",
            "statusFilter",
            "emailSort",
        ].forEach((x) => {
            if (!(x in req.body)) {
                copy[x] = undefined;
            }
        });
        copy.sessionkey = key;
        copy.currentPage = 0;
        copy.pageSize = config.global.pageSize;
        return expect(Rq.parseFilterUsersRequest(req)).resolves.toStrictEqual(
            copy
        );
    });

    const fails = [
        wrongStatus,
        wrongIsAdmin,
        wrongIsCoach,
        wrongNameSort,
        wrongEmailSort,
    ].map((x) => {
        const req: express.Request = getMockReq();
        req.body = { ...x };
        setSessionKey(req, key);
        return expect(Rq.parseFilterUsersRequest(req)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    const unauth = [
        nothing,
        isAdminFilterString,
        isCoachFilterString,
        nameFilter,
        emailFilterGoodEmail,
        emailFilterBadEmail,
        nameSort,
        statusFilter,
        emailSort,
    ].map((x) => {
        const req: express.Request = getMockReq();
        req.body = { ...x };
        return expect(Rq.parseFilterUsersRequest(req)).rejects.toBe(
            errors.cookUnauthenticated()
        );
    });

    return Promise.all([okays, fails, unauth].flat());
});

test("Can parse filter projects request", () => {
    const key = "my-session-key";

    const nothing = {};
    const projectNameFilter = {
        projectNameFilter: "Project name",
    };
    const clientNameFilter = {
        clientNameFilter: "Client name",
    };
    const assignedCoachesFilterArray = {
        assignedCoachesFilterArray: [1, 2],
    };
    const assignedCoachesFilterString = {
        assignedCoachesFilterArray: "1,2",
    };
    const fullyAssignedFilterString = {
        fullyAssignedFilter: "true",
    };
    const fullyAssignedFilterBoolean = {
        fullyAssignedFilter: true,
    };
    const projectNameSort = {
        projectNameSort: "asc",
    };
    const clientNameSort = {
        clientNameSort: "asc",
    };

    const wrongFullyAssignedFilter: T.Anything = {
        fullyAssignedFilter: "Fully assigned filter",
    };
    const wrongProjectNameSort: T.Anything = {
        projectNameSort: "Project name sort",
    };
    const wrongClientNameSort: T.Anything = {
        clientNameSort: "Client name sort",
    };

    const okays = [
        [nothing, nothing],
        [fullyAssignedFilterString, fullyAssignedFilterBoolean],
        [assignedCoachesFilterString, assignedCoachesFilterArray],
        [projectNameFilter, projectNameFilter],
        [clientNameFilter, clientNameFilter],
        [projectNameSort, projectNameSort],
        [clientNameSort, clientNameSort],
    ].map((x) => {
        const copy: T.Anything = { ...x[1] };
        const req: express.Request = getMockReq();
        req.body = x[0];
        setSessionKey(req, key);
        [
            "projectNameFilter",
            "clientNameFilter",
            "assignedCoachesFilterArray",
            "fullyAssignedFilter",
            "projectNameSort",
            "clientNameSort",
        ].forEach((x) => {
            if (!(x in req.body)) {
                copy[x] = undefined;
            }
        });
        copy.sessionkey = key;
        copy.currentPage = 0;
        copy.pageSize = config.global.pageSize;
        return expect(
            Rq.parseFilterProjectsRequest(req)
        ).resolves.toStrictEqual(copy);
    });

    const fails = [
        wrongFullyAssignedFilter,
        wrongProjectNameSort,
        wrongClientNameSort,
    ].map((x) => {
        const req: express.Request = getMockReq();
        req.body = { ...x };
        setSessionKey(req, key);
        return expect(Rq.parseFilterProjectsRequest(req)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    const unauth = [
        nothing,
        fullyAssignedFilterString,
        assignedCoachesFilterString,
        projectNameFilter,
        clientNameFilter,
        projectNameSort,
        clientNameSort,
    ].map((body) => {
        const req: express.Request = getMockReq();
        req.body = { ...body };
        expect(Rq.parseFilterProjectsRequest(req)).rejects.toBe(
            errors.cookUnauthenticated()
        );
    });

    return Promise.all([okays, fails, unauth].flat());
});

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
        name: "Jeff Georgette",
        email: "idonthavegithub@git.hub",
        pass: "thisismypassword",
    };

    const r2: T.Anything = {
        name: "Jeff Georgette",
        email: "idonthavegithub@git.hub",
    };

    const req1: express.Request = getMockReq();
    req1.body = { ...r1 };

    const req2: express.Request = getMockReq();
    req2.body = { ...r2 };

    const req3: express.Request = getMockReq();
    req3.body = {};

    const prom1: Promise<void> = expect(
        Rq.parseRequestUserRequest(req1)
    ).resolves.toStrictEqual(r1);
    const prom2: Promise<void> = expect(
        Rq.parseRequestUserRequest(req2)
    ).rejects.toBe(errors.cookArgumentError());
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
        roles: {
            roles: [
                {
                    name: "role1",
                    positions: 4,
                },
                {
                    name: "role2",
                    positions: 6,
                },
            ],
        },
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
        description: "Project description",
        start: Date.now(),
        end: Date.now(),
        positions: 69,
        modifyRoles: {
            roles: [
                {
                    id: 5,
                    positions: 4,
                },
                {
                    id: 2,
                    positions: 6,
                },
            ],
        },
        deleteRoles: {
            roles: [1, 3],
        },
    };
    const d2: T.Anything = {};
    const d3: T.Anything = {
        name: "Experiment One",
        partner: "Simic Combine",
        description: "Project description",
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
    d3.modifyRoles = undefined;
    d3.deleteRoles = undefined;
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
        studentId: 486453,
        role: "the useless one",
    };
    const d2: T.Anything = { studentId: 486453 };
    const d3: T.Anything = { studentId: 486453, role: "the lazy one" };

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
    };
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
        content: "hello-there",
        cc: "cc@gmail.com",
    };
    const ok6: T.Anything = {
        name: "my-template",
        cc: "cc@gmail.com",
    };
    const ok7: T.Anything = {
        name: "my-template",
        content: "hello-there",
        subject: "I like C++",
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
        ["name", "content", "subject", "cc"].forEach((v) => {
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

test("Can parse reset requests", () => {
    const v1: T.Anything = { email: "bob.student@gmail.com" };

    const req1: express.Request = getMockReq();
    req1.body = { ...v1 };
    const normalizedEmail: { email: string } = {
        email: "bobstudent@gmail.com",
    };

    const valid = expect(
        Rq.parseRequestResetRequest(req1)
    ).resolves.toStrictEqual(normalizedEmail);

    const i1: T.Anything = { email: "bob" };

    const req2: express.Request = getMockReq();
    req2.body = { ...i1 };

    const invalid = expect(Rq.parseRequestResetRequest(req2)).rejects.toBe(
        errors.cookArgumentError()
    );

    return Promise.all([valid, invalid]);
});

test("Can parse check reset code requests", () => {
    const id = 0;

    const req: express.Request = getMockReq();
    req.params.id = id.toString();

    const valid = expect(
        Rq.parseCheckResetCodeRequest(req)
    ).resolves.toStrictEqual({ code: id.toString() });

    const req2: express.Request = getMockReq();

    const invalid = expect(Rq.parseCheckResetCodeRequest(req2)).rejects.toBe(
        errors.cookArgumentError()
    );

    return Promise.all([valid, invalid]);
});

test("Can parse reset password requests", () => {
    const id = 0;
    const password: { password: string } = { password: "pass" };

    const req: express.Request = getMockReq();
    req.params.id = id.toString();
    req.body = { ...password };

    const valid = expect(
        Rq.parseResetPasswordRequest(req)
    ).resolves.toStrictEqual({
        code: id.toString(),
        password: password.password,
    });

    const req2: express.Request = getMockReq();
    req2.body = { ...password };

    const invalid1 = expect(Rq.parseResetPasswordRequest(req2)).rejects.toBe(
        errors.cookArgumentError()
    );

    const req3: express.Request = getMockReq();
    req2.params.id = id.toString();

    const invalid2 = expect(Rq.parseCheckResetCodeRequest(req3)).rejects.toBe(
        errors.cookArgumentError()
    );

    return Promise.all([valid, invalid1, invalid2]);
});

test("Can parse student role request", () => {
    const key = "my-key-arrived-but";

    const name: T.Anything = { name: "name" };
    const noName: T.Anything = {};

    const req: express.Request = getMockReq();
    req.body = { ...name };
    setSessionKey(req, key);
    name.sessionkey = key;
    const valid = expect(
        Rq.parseStudentRoleRequest(req)
    ).resolves.toStrictEqual(name);

    const req2: express.Request = getMockReq();
    req2.body = { ...noName };
    setSessionKey(req2, key);
    const invalid = expect(Rq.parseStudentRoleRequest(req2)).rejects.toBe(
        errors.cookArgumentError()
    );

    return Promise.all([valid, invalid]);
});

test("Can parse remove assignee request", () => {
    const key = "my-key-arrived-but";
    const id = 987465327465;

    const studentId: T.Anything = { student: 1 };
    const noStudentId: T.Anything = {};

    const req: express.Request = getMockReq();
    req.body = { ...studentId };
    req.params.id = id.toString();
    setSessionKey(req, key);
    studentId.id = id;
    studentId.sessionkey = key;

    const valid = expect(
        Rq.parseRemoveAssigneeRequest(req)
    ).resolves.toStrictEqual({
        sessionkey: studentId.sessionkey,
        studentId: studentId.student,
        id: studentId.id,
    });

    const req2: express.Request = getMockReq();
    req2.body = { ...noStudentId };
    req2.params.id = id.toString();
    setSessionKey(req2, key);
    studentId.id = id;
    studentId.sessionkey = key;

    const invalid = expect(Rq.parseRemoveAssigneeRequest(req2)).rejects.toBe(
        errors.cookArgumentError()
    );

    return Promise.all([valid, invalid]);
});

test("Can parse accept new user request", () => {
    const key = "my-key-arrived-but";
    const id = 987465327465;

    const v1: T.Anything = { is_admin: true, is_coach: true };

    const i1: T.Anything = { is_admin: true };
    const i2: T.Anything = { is_coach: true };
    const i3: T.Anything = {};

    const req1: express.Request = getMockReq();
    req1.body = { ...v1 };
    req1.params.id = id.toString();
    setSessionKey(req1, key);
    v1.id = id;
    v1.sessionkey = key;

    const valid = expect(
        Rq.parseAcceptNewUserRequest(req1)
    ).resolves.toStrictEqual(v1);

    const invalids = [i1, i2, i3].map((invalid) => {
        const req2: express.Request = getMockReq();
        req2.body = { ...invalid };
        req2.params.id = id.toString();
        setSessionKey(req2, key);
        invalid.id = id;
        invalid.sessionkey = key;

        return expect(Rq.parseAcceptNewUserRequest(req2)).rejects.toBe(
            errors.cookArgumentError()
        );
    });

    return Promise.all([[valid], invalids].flat());
});

test("Can parse new osoc edition request", () => {
    const key = "my-key-arrived-but";

    const year: T.Anything = { year: 2022 };
    const noYear: T.Anything = {};

    const req: express.Request = getMockReq();
    req.body = { ...year };
    setSessionKey(req, key);
    year.sessionkey = key;
    const valid = expect(
        Rq.parseNewOsocEditionRequest(req)
    ).resolves.toStrictEqual(year);

    const req2: express.Request = getMockReq();
    req2.body = { ...noYear };
    setSessionKey(req2, key);
    const invalid = expect(Rq.parseNewOsocEditionRequest(req2)).rejects.toBe(
        errors.cookArgumentError()
    );

    return Promise.all([valid, invalid]);
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
