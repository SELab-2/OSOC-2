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

import * as ormSe from "../../orm_functions/session_key";
jest.mock("../../orm_functions/session_key");
const ormSeMock = ormSe as jest.Mocked<typeof ormSe>;

import * as admin from "../../routes/admin";
import { errors } from "../../utility";

const people: (login_user & { person: person })[] = [
    {
        person: {
            person_id: 1,
            name: "Jeffrey Jan",
            email: "jeffrey@jan.be",
            github: null,
            github_id: null,
        },
        is_coach: false,
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
            github_id: "9846516845",
        },
        is_coach: false,
        is_admin: true,
        login_user_id: 8,
        person_id: 2,
        password: null,
        account_status: "ACTIVATED",
    },
];

// setup
beforeEach(() => {
    // mocks for request
    reqMock.parseAdminAllRequest.mockResolvedValue({ sessionkey: "abcd" });
    reqMock.parseSingleAdminRequest.mockResolvedValue({
        sessionkey: "abcd",
        id: 0,
    });
    reqMock.parseUpdateAdminRequest.mockImplementation((req) =>
        Promise.resolve(req.body)
    );
    reqMock.parseDeleteAdminRequest.mockResolvedValue({
        sessionkey: "abcd",
        id: 1,
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
    ormLMock.searchAllAdminLoginUsers.mockResolvedValue(people);
    ormLMock.updateLoginUser.mockImplementation((v) => {
        if (v.loginUserId != 7 && v.loginUserId != 8) return Promise.reject({});
        return Promise.resolve(v.loginUserId == 7 ? people[0] : people[1]);
    });
    ormLMock.deleteLoginUserByPersonId.mockImplementation((v) => {
        if (v != 1 && v != 2) return Promise.reject();
        return Promise.resolve(v == 1 ? people[0] : people[1]);
    });
    ormLMock.deleteLoginUserFromDB.mockImplementation((id) => {
        if (id !== 1 && id !== 2) return Promise.reject();
        return Promise.resolve();
    });
    ormPMock.deletePersonById.mockImplementation((v) => {
        if (v != 1 && v != 2) return Promise.reject();
        return Promise.resolve(v == 1 ? people[0].person : people[1].person);
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
});

// reset
afterEach(() => {
    reqMock.parseAdminAllRequest.mockReset();
    reqMock.parseSingleAdminRequest.mockReset();
    reqMock.parseUpdateAdminRequest.mockReset();
    reqMock.parseDeleteAdminRequest.mockReset();

    utilMock.checkSessionKey.mockReset();
    utilMock.isAdmin.mockReset();
    utilMock.mutable.mockReset();

    ormLMock.searchAllAdminLoginUsers.mockReset();
    ormLMock.deleteLoginUserByPersonId.mockReset();
    ormLMock.deleteLoginUserFromDB.mockReset();
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

test("Can list all admins.", async () => {
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
    }));

    await expect(admin.listAdmins(req)).resolves.toStrictEqual({
        data: res,
    });
    expect(utilMock.checkSessionKey).toHaveBeenCalledTimes(0);
    expectCall(reqMock.parseAdminAllRequest, req);
    expectCall(ormL.searchAllAdminLoginUsers, true);
    expect(utilMock.isAdmin).toHaveBeenCalledTimes(1);
});

test("Can modify a single admin (1).", async () => {
    const req = getMockReq();
    req.body = { id: 7, sessionkey: "abcd" };
    const res = { id: 7, name: "Jeffrey Jan" };
    await expect(admin.modAdmin(req)).resolves.toStrictEqual(res);
    expectCall(utilMock.isAdmin, { id: 7, sessionkey: "abcd" });
    expectCall(reqMock.parseUpdateAdminRequest, req);
    expectCall(ormLMock.updateLoginUser, {
        loginUserId: 7,
        isAdmin: undefined,
        isCoach: undefined,
        accountStatus: undefined,
    });
    expectNoCall(util.checkSessionKey);
    expect(utilMock.mutable).toHaveBeenCalledTimes(1);
});

test("Can't modify yourself as an admin", async () => {
    const req = getMockReq();
    req.body = { id: 0, sessionkey: "abcd" };
    await expect(admin.modAdmin(req)).rejects.toBe(errors.cookInvalidID());
});

test("Can modify a single admin and update the login user twice", async () => {
    const req = getMockReq();
    req.body = {
        id: 7,
        sessionkey: "abcd",
        isAdmin: false,
        isCoach: false,
        accountStatus: "PENDING",
    };
    const res = { id: 7, name: "Jeffrey Jan" };

    ormLMock.updateLoginUser.mockImplementationOnce(() =>
        Promise.resolve({
            person: {
                person_id: 1,
                name: "Jeffrey Jan",
                email: "jeffrey@jan.be",
                github: null,
                github_id: null,
            },
            is_coach: false,
            is_admin: false,
            login_user_id: 7,
            person_id: 1,
            password: "jeffreyForEver",
            account_status: "PENDING",
        })
    );

    ormLMock.updateLoginUser.mockImplementationOnce(() =>
        Promise.resolve({
            person: {
                person_id: 1,
                name: "Jeffrey Jan",
                email: "jeffrey@jan.be",
                github: null,
                github_id: null,
            },
            is_coach: false,
            is_admin: false,
            login_user_id: 7,
            person_id: 1,
            password: "jeffreyForEver",
            account_status: "DISABLED",
        })
    );

    ormSeMock.removeAllKeysForLoginUserId.mockResolvedValue(
        Promise.resolve({ count: 1 })
    );

    await expect(admin.modAdmin(req)).resolves.toStrictEqual(res);

    ormLMock.updateLoginUser.mockReset();
    ormSeMock.removeAllKeysForLoginUserId.mockReset();
});

test("Can modify a single admin (2).", async () => {
    const req = getMockReq();
    req.body = {
        id: 7,
        isAdmin: true,
        isCoach: false,
        sessionkey: "abcd",
    };
    const res = { id: 7, name: "Jeffrey Jan" };
    await expect(admin.modAdmin(req)).resolves.toStrictEqual(res);
    expectCall(utilMock.isAdmin, req.body);
    expectCall(reqMock.parseUpdateAdminRequest, req);
    expectCall(ormLMock.updateLoginUser, {
        loginUserId: 7,
        isAdmin: true,
        isCoach: false,
        accountStatus: undefined,
    });
    expectNoCall(util.checkSessionKey);
    expect(utilMock.mutable).toHaveBeenCalledTimes(1);
});

test("Can delete admins", async () => {
    const req = getMockReq();
    req.body = { id: 1, sessionkey: "abcd" };
    const res = {};

    await expect(admin.deleteAdmin(req)).resolves.toStrictEqual(res);
    expectCall(utilMock.isAdmin, req.body);
    expectCall(reqMock.parseDeleteAdminRequest, req);
    expectCall(ormLMock.deleteLoginUserFromDB, req.body.id);
    expect(utilMock.mutable).toHaveBeenCalledTimes(1);
});

test("Can't delete yourself as an admin", async () => {
    const req = getMockReq();
    req.body = { sessionkey: "abcd" };
    const id = 0;
    req.params.id = id.toString();

    reqMock.parseDeleteAdminRequest.mockResolvedValue({
        sessionkey: "abcd",
        id: 0,
    });

    await expect(admin.deleteAdmin(req)).rejects.toBe(errors.cookInvalidID());

    reqMock.parseDeleteAdminRequest.mockReset();
});
