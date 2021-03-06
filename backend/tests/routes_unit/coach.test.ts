// only test successes because
// 1: checkSessionKey/isAdmin has been tested
// 2: orm functions are fully tested
// 3: respOrError has been tested
// 4: all parsers have been tested
// -> failures use those stacks and aren't usually caught in the routes
// -> if those stacks work, all failures work as well (because Promises).

import { getMockReq } from "@jest-mock/express";
import { account_status_enum, login_user, person } from "@prisma/client";

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
import * as ormS from "../../orm_functions/session_key";
jest.mock("../../orm_functions/session_key");
const ormSMock = ormS as jest.Mocked<typeof ormS>;

import * as coach from "../../routes/coach";

const people: (login_user & { person: person })[] = [
    {
        person: {
            person_id: 1,
            name: "Jeffrey Jan",
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
            name: "Jan Jeffrey",
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
    ormLMock.searchLoginUserByPerson.mockResolvedValue({
        login_user_id: 1,
        person_id: 1,
        password: "test",
        is_admin: true,
        is_coach: true,
        account_status: account_status_enum.ACTIVATED,
        person: {
            person_id: 1,
            email: "test@email.com",
            github: null,
            name: "test",
            github_id: null,
        },
    });

    ormLMock.deleteLoginUserFromDB.mockImplementation((id) => {
        if (id !== 1 && id !== 2) return Promise.reject();
        return Promise.resolve();
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
    utilMock.mutable.mockImplementation((v) => Promise.resolve(v));

    // mocks for orm
    ormLMock.getAllLoginUsers.mockResolvedValue(people);
    ormLMock.searchAllCoachLoginUsers.mockResolvedValue(people);
    ormLMock.updateLoginUser.mockImplementation((v) => {
        if (v.loginUserId != 7 && v.loginUserId != 8) return Promise.reject({});
        const res = v.loginUserId == 7 ? people[0] : people[1];
        if (v.isAdmin == false && v.isCoach == false) {
            res.is_admin = false;
            res.is_coach = false;
        }
        return Promise.resolve(res);
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

    ormSMock.removeAllKeysForLoginUserId.mockResolvedValue({ count: 0 });
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
    utilMock.mutable.mockReset();

    ormLMock.getAllLoginUsers.mockReset();
    ormLMock.searchAllCoachLoginUsers.mockReset();
    ormLMock.deleteLoginUserByPersonId.mockReset();
    ormLMock.deleteLoginUserFromDB.mockReset();

    ormLMock.updateLoginUser.mockReset();
    ormPMock.deletePersonById.mockReset();

    ormSMock.removeAllKeysForLoginUserId.mockReset();
});

function expectCall<T, U>(func: T, val: U) {
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith(val);
}

test("Can list all coaches", async () => {
    const req = getMockReq();
    const res = people.map((val) => ({
        person_data: {
            id: val.person.person_id,
            name: val.person.name,
            email: val.person.email,
            github: val.person.github,
        },
        coach: val.is_coach,
        admin: val.is_admin,
        activated: val.account_status as string,
        login_user_id: val.login_user_id,
    }));

    await expect(coach.listCoaches(req)).resolves.toStrictEqual({
        data: res,
    });
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(0);
    expectCall(reqMock.parseCoachAllRequest, req);
    expectCall(ormL.searchAllCoachLoginUsers, true);
    expect(utilMock.isAdmin).toHaveBeenCalledTimes(1);
});

test("Can modify a single coach (1).", async () => {
    const req = getMockReq();
    req.body = { id: 7, sessionkey: "abcd" };
    const res = { id: 7, name: "Jeffrey Jan" };
    await expect(coach.modCoach(req)).resolves.toStrictEqual(res);
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(0);
    expectCall(reqMock.parseUpdateCoachRequest, req);
    expectCall(ormLMock.updateLoginUser, {
        loginUserId: 7,
        isAdmin: undefined,
        isCoach: undefined,
        accountStatus: undefined,
    });
    expect(utilMock.isAdmin).toHaveBeenCalledTimes(1);
    expect(utilMock.mutable).toHaveBeenCalledTimes(1);
});

test("Can modify a single coach (2).", async () => {
    const req = getMockReq();
    req.body = {
        id: 7,
        isAdmin: true,
        isCoach: false,
        sessionkey: "abcd",
    };
    const res = { id: 7, name: "Jeffrey Jan" };
    await expect(coach.modCoach(req)).resolves.toStrictEqual(res);
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(0);
    expectCall(reqMock.parseUpdateCoachRequest, req);
    expectCall(ormLMock.updateLoginUser, {
        loginUserId: 7,
        isAdmin: true,
        isCoach: false,
        accountStatus: undefined,
    });
    expect(utilMock.isAdmin).toHaveBeenCalledTimes(1);
    expect(utilMock.mutable).toHaveBeenCalledTimes(1);
});

test("Can force-logout a coach", async () => {
    const req = getMockReq();
    req.body = {
        id: 7,
        isAdmin: false,
        isCoach: false,
        sessionkey: "abcd",
    };
    const res = { id: 7, name: "Jeffrey Jan" };
    await expect(coach.modCoach(req)).resolves.toStrictEqual(res);
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(0);
    expectCall(reqMock.parseUpdateCoachRequest, req);
    expect(ormLMock.updateLoginUser).toHaveBeenCalledTimes(2);
    expect(utilMock.isAdmin).toHaveBeenCalledTimes(1);
    expect(utilMock.mutable).toHaveBeenCalledTimes(1);
    expectCall(ormSMock.removeAllKeysForLoginUserId, 7);
});

test("Can delete coaches", async () => {
    const req = getMockReq();
    req.body = { id: 1, sessionkey: "abcd" };
    const res = {};

    await expect(coach.deleteCoach(req)).resolves.toStrictEqual(res);
    expectCall(utilMock.isAdmin, req.body);
    expectCall(reqMock.parseDeleteCoachRequest, req);
    expectCall(ormLMock.deleteLoginUserFromDB, req.body.id);
    expect(utilMock.mutable).toHaveBeenCalledTimes(1);
});

test("Can't update oneself", async () => {
    utilMock.isAdmin.mockReset();
    utilMock.isAdmin.mockImplementation((v) =>
        Promise.resolve({
            userId: 7,
            data: v,
            accountStatus: "ACTIVATED",
            is_admin: true,
            is_coach: true,
        })
    );

    const req = getMockReq();
    req.body = {
        id: 7,
        isAdmin: false,
        isCoach: false,
        sessionkey: "abcd",
    };

    await expect(coach.modCoach(req)).rejects.toStrictEqual(
        util.errors.cookInvalidID()
    );
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(0);
    expectCall(reqMock.parseUpdateCoachRequest, req);
    expect(ormLMock.updateLoginUser).toHaveBeenCalledTimes(0);
    expect(utilMock.isAdmin).toHaveBeenCalledTimes(1);
    expect(utilMock.mutable).toHaveBeenCalledTimes(1);
});

test("Can assign coach role when activating", async () => {
    const req = getMockReq();
    req.body = {
        id: 7,
        isAdmin: false,
        isCoach: false,
        accountStatus: account_status_enum.ACTIVATED,
        sessionkey: "abcd",
    };
    ormLMock.getLoginUserById.mockResolvedValue({
        login_user_id: 1,
        person_id: 1,
        password: "test",
        is_admin: false,
        is_coach: false,
        account_status: account_status_enum.DISABLED,
        person: {
            person_id: 1,
            email: "test@email.com",
            github: null,
            name: "test",
            github_id: null,
        },
    });
    const res = { id: 7, name: "Jeffrey Jan" };
    await expect(coach.modCoach(req)).resolves.toStrictEqual(res);
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(0);
    expectCall(reqMock.parseUpdateCoachRequest, req);
    expectCall(ormLMock.updateLoginUser, {
        loginUserId: 7,
        isAdmin: false,
        isCoach: true,
        accountStatus: account_status_enum.ACTIVATED,
    });
    expect(utilMock.isAdmin).toHaveBeenCalledTimes(1);
    expect(utilMock.mutable).toHaveBeenCalledTimes(1);

    ormLMock.getLoginUserById.mockReset();
});
