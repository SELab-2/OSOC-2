// only test successes because
// 1: checkSessionKey/isAdmin has been tested
// 2: orm functions are fully tested
// 3: respOrError has been tested
// 4: all parsers have been tested
// -> failures use those stacks and aren't usually caught in the routes
// -> if those stacks work, all failures work as well (because Promises).

import { getMockReq } from "@jest-mock/express";
import { login_user, person } from "@prisma/client";

// setup mock for request
import * as req from "../../request";
jest.mock("../../request");
const reqMock = req as jest.Mocked<typeof req>;

// setup mock for utility
import * as util from "../../utility";
jest.mock("../../utility");
const utilMock = util as jest.Mocked<typeof util>;

// setup mocks for orm
import * as ormL from "../../orm_functions/login_user";
jest.mock("../../orm_functions/login_user");
const ormLMock = ormL as jest.Mocked<typeof ormL>;
import * as ormP from "../../orm_functions/person";
jest.mock("../../orm_functions/person");
const ormPMock = ormP as jest.Mocked<typeof ormP>;

import * as coach from "../../routes/coach";

const people: (login_user & { person: person })[] = [
    {
        person: {
            person_id: 1,
            firstname: "Jeffrey",
            lastname: "Jan",
            email: "jeffrey@jan.be",
            github: null,
            github_id: null,
        },
        is_coach: true,
        is_admin: true,
        login_user_id: 7,
        person_id: 1,
        password: "jeffreyForEver",
        account_status: "PENDING",
    },
    {
        person: {
            person_id: 2,
            firstname: "Jan",
            lastname: "Jeffrey",
            email: null,
            github: "@jan_jeffrey",
            github_id: "16968456845",
        },
        is_coach: true,
        is_admin: false,
        login_user_id: 8,
        person_id: 2,
        password: null,
        account_status: "ACTIVATED",
    },
];

// setup
beforeEach(() => {
    // mocks for request
    reqMock.parseCoachAllRequest.mockResolvedValue({ sessionkey: "abcd" });
    reqMock.parseSingleCoachRequest.mockResolvedValue({
        sessionkey: "abcd",
        id: 0,
    });
    reqMock.parseUpdateCoachRequest.mockImplementation((req) =>
        Promise.resolve(req.body)
    );
    reqMock.parseGetCoachRequestRequest.mockResolvedValue({
        sessionkey: "abcd",
        id: 17,
    });
    reqMock.parseDeleteCoachRequest.mockResolvedValue({
        sessionkey: "abcd",
        id: 1,
    });
    reqMock.parseGetAllCoachRequestsRequest.mockResolvedValue({
        sessionkey: "abcd",
    });

    // mocks for utility
    utilMock.checkSessionKey.mockImplementation((v) =>
        Promise.resolve({
            userId: 0,
            data: v,
            accountStatus: "ACTIVATED",
            is_admin: true,
            is_coach: true,
        })
    );
    utilMock.isAdmin.mockImplementation((v) =>
        Promise.resolve({
            userId: 0,
            data: v,
            accountStatus: "ACTIVATED",
            is_admin: true,
            is_coach: true,
        })
    );

    // mocks for orm
    ormLMock.getAllLoginUsers.mockResolvedValue(people);
    ormLMock.searchAllCoachLoginUsers.mockResolvedValue(people);
    ormLMock.updateLoginUser.mockImplementation((v) => {
        if (v.loginUserId != 7 && v.loginUserId != 8) return Promise.reject({});
        return Promise.resolve(v.loginUserId == 7 ? people[0] : people[1]);
    });
    ormLMock.deleteLoginUserByPersonId.mockImplementation((v) => {
        if (v != 1 && v != 2) {
            console.log("invalid id (delete login user) " + v);
            return Promise.reject();
        }
        return Promise.resolve(v == 1 ? people[0] : people[1]);
    });

    ormPMock.deletePersonById.mockImplementation((v) => {
        if (v != 1 && v != 2) {
            console.log("invalid id (delete person) " + v);
            return Promise.reject();
        }
        return Promise.resolve(v == 1 ? people[0].person : people[1].person);
    });
});

// reset
afterEach(() => {
    reqMock.parseCoachAllRequest.mockReset();
    reqMock.parseSingleCoachRequest.mockReset();
    reqMock.parseUpdateCoachRequest.mockReset();
    reqMock.parseDeleteCoachRequest.mockReset();
    reqMock.parseGetAllCoachRequestsRequest.mockReset();
    reqMock.parseGetCoachRequestRequest.mockReset();

    utilMock.checkSessionKey.mockReset();
    utilMock.isAdmin.mockReset();

    ormLMock.getAllLoginUsers.mockReset();
    ormLMock.searchAllCoachLoginUsers.mockReset();
    ormLMock.deleteLoginUserByPersonId.mockReset();
    ormLMock.updateLoginUser.mockReset();
    ormPMock.deletePersonById.mockReset();
});

function expectCall<T, U>(func: T, val: U) {
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(val);
}

function expectNoCall<T>(func: T) {
    expect(func).toHaveBeenCalledTimes(0);
}

test("Can list all coaches", async () => {
    const req = getMockReq();
    const res = people.map((val) => ({
        person_data: {
            id: val.person.person_id,
            name: val.person.firstname,
            email: val.person.email,
            github: val.person.github,
        },
        coach: val.is_coach,
        admin: val.is_admin,
        activated: val.account_status as string,
    }));

    await expect(coach.listCoaches(req)).resolves.toStrictEqual({
        data: res,
        sessionkey: "abcd",
    });
    expectCall(utilMock.checkSessionKey, { sessionkey: "abcd" });
    expectCall(reqMock.parseCoachAllRequest, req);
    expectCall(ormL.searchAllCoachLoginUsers, true);
    expectNoCall(utilMock.isAdmin);
});

test("Getting a single coach is deprecated.", async () => {
    await expect(coach.getCoach(getMockReq())).rejects.toStrictEqual({
        http: 410,
        reason: "Deprecated endpoint.",
    });
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(1);
    expectNoCall(utilMock.isAdmin);
});

test("Can modify a single coach (1).", async () => {
    const req = getMockReq();
    req.body = { id: 7, pass: "jeff", sessionkey: "abcd" };
    const res = { data: { id: 7, name: "Jeffrey Jan" }, sessionkey: "abcd" };
    await expect(coach.modCoach(req)).resolves.toStrictEqual(res);
    expectCall(utilMock.checkSessionKey, {
        id: 7,
        pass: "jeff",
        sessionkey: "abcd",
    });
    expectCall(reqMock.parseUpdateCoachRequest, req);
    expectCall(ormLMock.updateLoginUser, {
        loginUserId: 7,
        password: "jeff",
        isAdmin: undefined,
        isCoach: undefined,
        accountStatus: undefined,
    });
    expectNoCall(util.isAdmin);
});

test("Can modify a single coach (2).", async () => {
    const req = getMockReq();
    req.body = {
        id: 7,
        pass: "jeff",
        isAdmin: true,
        isCoach: false,
        sessionkey: "abcd",
    };
    const res = { data: { id: 7, name: "Jeffrey Jan" }, sessionkey: "abcd" };
    await expect(coach.modCoach(req)).resolves.toStrictEqual(res);
    expectCall(utilMock.checkSessionKey, req.body);
    expectCall(reqMock.parseUpdateCoachRequest, req);
    expectCall(ormLMock.updateLoginUser, {
        loginUserId: 7,
        password: "jeff",
        isAdmin: true,
        isCoach: false,
        accountStatus: undefined,
    });
    expectNoCall(util.isAdmin);
});

test("Can delete coaches", async () => {
    const req = getMockReq();
    req.body = { id: 1, sessionkey: "abcd" };
    const res = { sessionkey: "abcd" };

    await expect(coach.deleteCoach(req)).resolves.toStrictEqual(res);
    expectCall(utilMock.isAdmin, req.body);
    expectCall(reqMock.parseDeleteCoachRequest, req);
    expectCall(ormLMock.deleteLoginUserByPersonId, req.body.id);
    expectCall(ormPMock.deletePersonById, req.body.id);
});

test("Can get coach requests", async () => {
    const req = getMockReq();
    const res_ = people
        .filter((v) => v.is_coach && v.account_status == "PENDING")
        .map((v) => ({
            person_data: {
                id: v.person.person_id,
                name: v.person.firstname,
            },
            coach: v.is_coach,
            admin: v.is_admin,
            activated: v.account_status as string,
        }));
    const res = { data: res_, sessionkey: "abcd" };
    await expect(coach.getCoachRequests(req)).resolves.toStrictEqual(res);
    expectCall(utilMock.isAdmin, { sessionkey: "abcd" });
    expectCall(reqMock.parseGetAllCoachRequestsRequest, req);
    expect(ormLMock.getAllLoginUsers).toHaveBeenCalledTimes(1);
});

test("Getting a single coach request is deprecated.", async () => {
    await expect(coach.getCoachRequest(getMockReq())).rejects.toStrictEqual({
        http: 410,
        reason: "Deprecated endpoint.",
    });
    expect(utilMock.isAdmin).toHaveBeenCalledTimes(1);
    expectNoCall(utilMock.checkSessionKey);
});
